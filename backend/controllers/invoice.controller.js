// invoice.controller.js
import Invoice from "../models/invoice.model.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import Technician from "../models/technician.model.js";
import Service from "../models/service.model.js";
import Warranty from "../models/warranty.model.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import nodemailer from "nodemailer";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";
import mongoose from "mongoose";

// Email transporter configuration
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Generate sequential invoice number
const generateInvoiceNumber = async () => {
    try {
        const lastInvoice = await Invoice.findOne({}, {}, { sort: { 'invoiceSequence': -1 } });
        const sequence = lastInvoice ? lastInvoice.invoiceSequence + 1 : 1;

        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const sequenceStr = String(sequence).padStart(4, '0');

        return `INV-${year}${month}-${sequenceStr}`;
    } catch (error) {
        console.error('Error generating invoice number:', error);
        // Fallback to timestamp-based number
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 6);
        return `INV-${timestamp}-${randomStr}`.toUpperCase();
    }
};

// Calculate tax breakdown
const calculateTaxBreakdown = (subtotal, taxRates = []) => {
    const taxBreakdown = [];
    let totalTax = 0;

    taxRates.forEach(taxRate => {
        const taxAmount = (subtotal * taxRate.rate) / 100;
        taxBreakdown.push({
            taxType: taxRate.type,
            taxRate: taxRate.rate,
            taxableAmount: subtotal,
            taxAmount: taxAmount
        });
        totalTax += taxAmount;
    });

    return { taxBreakdown, totalTax };
};

// Create invoice with comprehensive data
export const createInvoice = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const {
            items,
            discount,
            taxRates,
            dueDate,
            notes,
            termsAndConditions,
            template = 'standard'
        } = req.body;

        console.log('=== Creating Invoice ===');
        console.log('Booking ID:', bookingId);

        // Get booking with all related data
        const booking = await Booking.findById(bookingId)
            .populate('user')
            .populate({
                path: 'technician',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            })
            .populate('service');

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({
                message: "Invoice can only be created for completed bookings"
            });
        }

        // Get technician details
        const technician = await Technician.findById(booking.technician)
            .populate('user', 'name email phone');

        if (!technician) {
            return res.status(404).json({
                message: "Technician not found"
            });
        }

        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ booking: bookingId });
        if (existingInvoice) {
            return res.status(400).json({
                message: "Invoice already exists for this booking"
            });
        }

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();
        const invoiceSequence = parseInt(invoiceNumber.split('-')[2]);

        // Calculate financials
        const subtotal = booking.finalCost || booking.estimatedCost || 0;
        const { taxBreakdown, totalTax } = calculateTaxBreakdown(subtotal, taxRates || []);

        // Calculate discount
        let discountAmount = 0;
        if (discount && discount.amount > 0) {
            discountAmount = discount.type === 'percentage'
                ? (subtotal * discount.amount) / 100
                : discount.amount;
        }

        const totalAmount = subtotal + totalTax - discountAmount;

        // Prepare invoice items
        const invoiceItems = items || [{
            description: booking.service.name,
            category: 'labor',
            unitPrice: subtotal,
            totalPrice: subtotal,
            taxRate: 0,
            taxAmount: 0
        }];

        // Create invoice
        const invoice = new Invoice({
            booking: bookingId,
            invoiceNumber,
            invoiceSequence,
            user: booking.user._id,
            customerDetails: {
                name: booking.user.name,
                email: booking.user.email,
                phone: booking.user.phone,
                billingAddress: {
                    street: booking.address || '',
                    city: booking.user.address?.city || '',
                    area: booking.user.address?.area || '',
                    postalCode: booking.user.address?.postalCode || ''
                }
            },
            technician: booking.technician,
            technicianDetails: {
                name: technician.user.name,
                email: technician.user.email,
                phone: technician.user.phone,
                licenseNumber: technician.licenseNumber,
                specialization: technician.specialization
            },
            service: booking.service._id,
            serviceDetails: {
                name: booking.service.name,
                category: booking.service.category,
                description: booking.description,
                estimatedDuration: booking.service.estimatedDuration
            },
            items: invoiceItems,
            subtotal,
            discount: {
                amount: discountAmount,
                type: discount?.type || 'fixed',
                description: discount?.description || ''
            },
            taxBreakdown,
            totalTax,
            totalAmount,
            serviceDate: booking.completedAt || booking.createdAt,
            dueDate: dueDate ? new Date(dueDate) : moment().add(30, 'days').toDate(),
            completedAt: booking.completedAt,
            notes,
            termsAndConditions: termsAndConditions || 'Payment is due within 30 days. Late payments may incur additional charges.',
            template,
            status: 'sent', // Invoice is sent when created
            paymentStatus: 'pending', // Payment is pending until customer confirms
            createdBy: req.user?.id,
            lastModifiedBy: req.user?.id
        });

        await invoice.save();

        // Auto-generate warranty record when invoice created (service completed)
        try {
            // Warranty period by service type
            const serviceType = booking.service?.category || 'general';
            const warrantyPeriods = {
                electronics: 90,
                appliance: 60,
                mobile: 30,
                computer: 30,
                general: 15
            };
            const periodDays = warrantyPeriods[(serviceType || '').toLowerCase()] || 15;

            // Generate simple warranty number: WRT-YYYY-NNNNNN
            const year = new Date().getFullYear();
            const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
            const warrantyNumber = `WRT-${year}-${rand}`;

            const serviceCompletionDate = booking.completedAt || new Date();
            const startDate = serviceCompletionDate;
            const endDate = new Date(serviceCompletionDate.getTime() + periodDays * 24 * 60 * 60 * 1000);

            const warranty = new Warranty({
                warrantyNumber,
                booking: booking._id,
                invoice: invoice._id,
                serviceCompletionDate,
                startDate,
                endDate,
                periodDays,
                covered: [
                    'Parts replaced during service',
                    'Labor performed during service'
                ],
                excluded: [
                    'Damage from misuse or accidents',
                    'Normal wear and tear',
                    'Issues unrelated to this service'
                ],
                status: 'active'
            });

            await warranty.save();

            // Attach warranty id to invoice for reference
            invoice.warranty = warranty._id;
            await invoice.save();
        } catch (wErr) {
            console.error('Failed to create warranty record:', wErr);
        }

        console.log('Invoice created successfully:', invoice._id);

        res.status(201).json({
            message: "Invoice created successfully",
            invoice
        });

    } catch (error) {
        console.error("Create Invoice Error:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// Generate and save PDF
export const generateInvoicePDF = async (req, res) => {
    try {
        const { invoiceId } = req.params;

        console.log('=== Generating PDF for Invoice ===');
        console.log('Invoice ID:', invoiceId);

        const invoice = await Invoice.findById(invoiceId)
            .populate('user', 'name email phone address')
            .populate({
                path: 'technician',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            })
            .populate('service')
            .populate('booking');

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Debug technician data
        console.log('Technician data:', {
            technician: invoice.technician,
            technicianDetails: invoice.technicianDetails,
            technicianUser: invoice.technician?.user,
            technicianName: invoice.technician?.user?.name || invoice.technician?.name
        });

        // If technician exists but user data is not populated, try to populate it
        if (invoice.technician && !invoice.technician.user) {
            console.log('Technician exists but user not populated, trying to populate...');
            try {
                await invoice.populate({
                    path: 'technician',
                    populate: {
                        path: 'user',
                        select: 'name email phone'
                    }
                });
                console.log('Repopulated technician data:', invoice.technician);
            } catch (error) {
                console.error('Error repopulating technician:', error);
            }
        }

        // Additionally, attempt to load the Technician document directly as a fallback
        let technicianDoc = null;
        try {
            if (invoice.technician) {
                // invoice.technician might be an ObjectId or a populated doc
                const techId = (typeof invoice.technician === 'object' && invoice.technician._id) ? invoice.technician._id : invoice.technician;
                technicianDoc = await Technician.findById(techId).populate('user', 'name email phone');
                // prefer the populated invoice.technician if it has user, otherwise use technicianDoc
                if (!invoice.technician || !invoice.technician.user) {
                    invoice.technician = technicianDoc || invoice.technician;
                }
            }
        } catch (techErr) {
            console.error('Failed to load technician document for PDF:', techErr);
        }

        // If still no technician info, try to find technician via the booking record
        try {
            if ((!invoice.technician || !invoice.technician.user) && invoice.booking) {
                const bookingDoc = await Booking.findById(invoice.booking).populate({
                    path: 'technician',
                    populate: { path: 'user', select: 'name email phone' }
                });
                if (bookingDoc && bookingDoc.technician) {
                    const bTech = bookingDoc.technician;
                    // attach to invoice for downstream usage
                    invoice.technician = invoice.technician || bTech;
                    technicianDoc = technicianDoc || bTech;
                }
            }
        } catch (bErr) {
            console.error('Failed to load technician via booking for PDF:', bErr);
        }

        // Sanitize items and financials to ensure PDF matches saved invoice
        const sanitizedItems = (invoice.items || []).map(it => {
            const quantity = it.quantity || 1;
            const unitPrice = Number(it.unitPrice || 0);
            const totalPrice = Number((unitPrice * quantity).toFixed(2));
            const taxAmount = Number(it.taxAmount || 0);
            return {
                description: it.description,
                quantity,
                unitPrice,
                totalPrice,
                taxRate: it.taxRate || 0,
                taxAmount
            };
        });

        // Ensure a warranty exists for this invoice; auto-create if missing
        if (!invoice.warranty) {
            try {
                const serviceType = invoice.serviceDetails?.category || invoice.service?.category || 'general';
                const warrantyPeriods = {
                    electronics: 90,
                    appliance: 60,
                    mobile: 30,
                    computer: 30,
                    general: 15
                };
                const periodDays = warrantyPeriods[(serviceType || '').toLowerCase()] || 15;

                const year = new Date().getFullYear();
                const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
                const warrantyNumber = `WRT-${year}-${rand}`;

                const serviceCompletionDate = invoice.serviceDate || invoice.completedAt || new Date();
                const startDate = serviceCompletionDate;
                const endDate = new Date(serviceCompletionDate.getTime() + periodDays * 24 * 60 * 60 * 1000);

                const warranty = new Warranty({
                    warrantyNumber,
                    booking: invoice.booking,
                    invoice: invoice._id,
                    serviceCompletionDate,
                    startDate,
                    endDate,
                    periodDays,
                    covered: [
                        'Parts replaced during service',
                        'Labor performed during service'
                    ],
                    excluded: [
                        'Damage from misuse or accidents',
                        'Normal wear and tear',
                        'Issues unrelated to this service'
                    ],
                    status: 'active'
                });

                await warranty.save();
                invoice.warranty = warranty._id;
                await invoice.save();
            } catch (wErr) {
                console.error('Failed to auto-create warranty for invoice PDF:', wErr);
            }
        }

        const pdfInvoiceData = {
            // Branding information
            branding: {
                companyName: 'Repair Portal',
                companyAddress: {
                    street: '123 Service Street',
                    city: 'Dhaka',
                    area: 'Gulshan',
                    country: 'Bangladesh'
                },
                companyPhone: '+880 1234-567890',
                companyEmail: 'support@repairportal.com'
            },

            // Invoice metadata
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            serviceDate: invoice.serviceDate,

            // Customer details
            customerDetails: {
                name: invoice.customerDetails?.name || invoice.user?.name || 'N/A',
                email: invoice.customerDetails?.email || invoice.user?.email || 'N/A',
                phone: invoice.customerDetails?.phone || invoice.user?.phone || 'N/A',
                billingAddress: {
                    street: invoice.customerDetails?.billingAddress?.street || invoice.user?.address?.street || 'N/A',
                    city: invoice.customerDetails?.billingAddress?.city || invoice.user?.address?.city || 'N/A',
                    area: invoice.customerDetails?.billingAddress?.area || invoice.user?.address?.area || 'N/A',
                    postalCode: invoice.customerDetails?.billingAddress?.postalCode || invoice.user?.address?.postalCode || 'N/A',
                    country: invoice.customerDetails?.billingAddress?.country || 'Bangladesh'
                },

            },

            // Technician details (robust fallbacks: invoice.technicianDetails -> populated technician.user -> technician doc fields -> sensible fallbacks)
            technicianDetails: {
                name: (
                    invoice.technicianDetails?.name ||
                    invoice.technician?.user?.name ||
                    technicianDoc?.user?.name ||
                    invoice.technician?.name ||
                    technicianDoc?.name ||
                    invoice.technician?.user?.email ||
                    'Technician Not Assigned'
                ),
                email: (
                    invoice.technicianDetails?.email ||
                    invoice.technician?.user?.email ||
                    technicianDoc?.user?.email ||
                    'N/A'
                ),
                phone: (
                    invoice.technicianDetails?.phone ||
                    invoice.technician?.user?.phone ||
                    technicianDoc?.user?.phone ||
                    'N/A'
                ),
                specialization: invoice.technicianDetails?.specialization || invoice.technician?.specialization || 'N/A',
                licenseNumber: invoice.technicianDetails?.licenseNumber || invoice.technician?.licenseNumber || 'N/A'
            },

            // Service details
            serviceDetails: {
                name: invoice.serviceDetails?.name || invoice.service?.name || 'N/A',
                category: invoice.serviceDetails?.category || invoice.service?.category || 'N/A',
                description: invoice.serviceDetails?.description || invoice.service?.description || 'N/A'
            },

            // Invoice items
            items: sanitizedItems,

            // Financial information (use saved invoice totals)
            subtotal: Number(invoice.subtotal || 0),
            discount: invoice.discount || { amount: 0, type: 'fixed' },
            totalTax: Number(invoice.totalTax || 0),
            totalAmount: Number(invoice.totalAmount || 0),
            currency: invoice.currency || { code: 'USD', symbol: '$' },

            // Template and additional info
            template: invoice.template || 'standard',
            termsAndConditions: invoice.termsAndConditions || 'Payment is due within 30 days. Late payments may incur additional charges.',
            notes: invoice.notes || ''
        };

    // Force single-page PDF for this generation to avoid multi-page/truncated files on technician side
    pdfInvoiceData.singlePage = true;

    console.log('PDF payload - technicianDetails:', pdfInvoiceData.technicianDetails, 'singlePage:', pdfInvoiceData.singlePage);

    console.log('PDF payload - technicianDetails:', pdfInvoiceData.technicianDetails);

        // If warranty is linked, populate warranty details
        if (invoice.warranty) {
            try {
                const warranty = await Warranty.findById(invoice.warranty);
                if (warranty) {
                    pdfInvoiceData.warranty = {
                        warrantyNumber: warranty.warrantyNumber,
                        serviceCompletionDate: warranty.serviceCompletionDate,
                        startDate: warranty.startDate,
                        endDate: warranty.endDate,
                        periodDays: warranty.periodDays,
                        covered: warranty.covered,
                        excluded: warranty.excluded,
                        status: warranty.status
                    };
                }
            } catch (wErr) {
                console.error('Failed to load warranty for PDF:', wErr);
            }
        }

        // Create invoices directory if it doesn't exist and verify write access
        const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
        try {
            await fs.ensureDir(invoicesDir);
        } catch (dirErr) {
            console.error('Failed to ensure invoices directory:', dirErr);
            return res.status(500).json({ message: 'Failed to prepare invoices directory', error: dirErr.message });
        }

        // Generate PDF
        const pdfFilename = `${invoice.invoiceNumber}.pdf`;
        const pdfPath = path.join(invoicesDir, pdfFilename);

        try {
            await PDFGenerator.generateInvoicePDF(pdfInvoiceData, pdfPath, invoice.template);

            // Update invoice with PDF info
            invoice.pdfPath = pdfPath;
            invoice.pdfUrl = `/uploads/invoices/${pdfFilename}`;
            invoice.pdfGeneratedAt = new Date();
            await invoice.save();

            console.log('PDF generated successfully:', pdfPath);

            res.status(200).json({
                message: "PDF generated successfully",
                pdfUrl: invoice.pdfUrl
            });
        } catch (pdfErr) {
            console.error('PDF generation failed:', pdfErr);
            // Return stack to aid debugging in dev (remove in production)
            return res.status(500).json({ message: 'PDF generation failed', error: pdfErr.message, stack: pdfErr.stack });
        }
    } catch (error) {
        console.error("Generate PDF Error:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// Send invoice via email
export const sendInvoiceEmail = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const { customMessage } = req.body;

        console.log('=== Sending Invoice Email ===');
        console.log('Invoice ID:', invoiceId);

        const invoice = await Invoice.findById(invoiceId)
            .populate('user', 'name email')
            .populate('technician');

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (!invoice.pdfUrl) {
            return res.status(400).json({ message: "PDF must be generated before sending email" });
        }

        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: invoice.customerDetails.email,
            subject: `Invoice ${invoice.invoiceNumber} from Repair Portal`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Invoice ${invoice.invoiceNumber}</h2>
                    <p>Dear ${invoice.customerDetails.name},</p>

                    <p>Please find attached your invoice for the recent service.</p>

                    ${customMessage ? `<p>${customMessage}</p>` : ''}

                    <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
                        <h3>Invoice Summary</h3>
                        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                        <p><strong>Service Date:</strong> ${moment(invoice.serviceDate).format('MMMM DD, YYYY')}</p>
                        <p><strong>Total Amount:</strong> ${invoice.currency.symbol}${invoice.totalAmount}</p>
                        <p><strong>Due Date:</strong> ${moment(invoice.dueDate).format('MMMM DD, YYYY')}</p>
                    </div>

                    <p>You can also download your invoice from your account dashboard.</p>

                    <p>Thank you for choosing our service!</p>

                    <p>Best regards,<br>Repair Portal Team</p>
                </div>
            `,
            attachments: [{
                filename: `${invoice.invoiceNumber}.pdf`,
                path: path.join(process.cwd(), invoice.pdfPath)
            }]
        };

        await transporter.sendMail(mailOptions);

        // Update invoice email status
        invoice.emailSent = true;
        invoice.emailSentAt = new Date();
        invoice.emailHistory.push({
            sentAt: new Date(),
            recipient: invoice.customerDetails.email,
            subject: mailOptions.subject,
            status: 'sent'
        });
        await invoice.save();

        console.log('Invoice email sent successfully');

        res.status(200).json({
            message: "Invoice email sent successfully",
            invoice
        });

    } catch (error) {
        console.error("Send Email Error:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// Get invoice by ID with full details
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('user', 'name email phone address')
            .populate('technician')
            .populate('service')
            .populate('booking')
            .populate('createdBy', 'name')
            .populate('lastModifiedBy', 'name');

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json(invoice);
    } catch (error) {
        console.error("Get Invoice Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get invoices by user
export const getUserInvoices = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const query = { user: userId };

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const invoices = await Invoice.find(query)
            .populate({
                path: 'technician',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            })
            .populate('service', 'name category')
            .populate('booking', 'completedAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Invoice.countDocuments(query);

        res.status(200).json({
            invoices,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error("Get User Invoices Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get technician invoices
export const getTechnicianInvoices = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const query = { technician: technicianId };
        if (status) {
            query.status = status;
        }

        const invoices = await Invoice.find(query)
            .populate('user', 'name email phone')
            .populate('service', 'name category')
            .populate('booking', 'completedAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Invoice.countDocuments(query);

        res.status(200).json({
            invoices,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error("Get Technician Invoices Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update invoice
export const updateInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const updateData = req.body;

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Prevent updates if invoice is paid or cancelled
        if (['paid', 'cancelled'].includes(invoice.status)) {
            return res.status(400).json({
                message: "Cannot update paid or cancelled invoices"
            });
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== '_id' && key !== 'createdAt') {
                invoice[key] = updateData[key];
            }
        });

        invoice.lastModifiedBy = req.user?.id;
        await invoice.save();

        res.status(200).json({
            message: "Invoice updated successfully",
            invoice
        });

    } catch (error) {
        console.error("Update Invoice Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const { status, notes } = req.body;

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        invoice.status = status;
        invoice.lastModifiedBy = req.user?.id;

        if (notes) {
            invoice.statusHistory[invoice.statusHistory.length - 1].notes = notes;
        }

        await invoice.save();

        res.status(200).json({
            message: "Invoice status updated successfully",
            invoice
        });

    } catch (error) {
        console.error("Update Invoice Status Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete invoice (soft delete by marking as cancelled)
export const deleteInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Only allow deletion of draft invoices
        if (invoice.status !== 'draft') {
            return res.status(400).json({
                message: "Only draft invoices can be deleted"
            });
        }

        invoice.status = 'cancelled';
        invoice.lastModifiedBy = req.user?.id;
        await invoice.save();

        res.status(200).json({
            message: "Invoice cancelled successfully",
            invoice
        });

    } catch (error) {
        console.error("Delete Invoice Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Batch operations
export const batchUpdateInvoices = async (req, res) => {
    try {
        const { invoiceIds, operation, data } = req.body;

        if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({ message: "Invoice IDs array is required" });
        }

        const results = [];

        for (const invoiceId of invoiceIds) {
            try {
                const invoice = await Invoice.findById(invoiceId);

                if (!invoice) {
                    results.push({ invoiceId, success: false, error: "Invoice not found" });
                    continue;
                }

                switch (operation) {
                    case 'updateStatus':
                        invoice.status = data.status;
                        break;
                    case 'sendEmail':
                        // Email sending logic would go here
                        break;
                    case 'generatePDF':
                        // PDF generation logic would go here
                        break;
                    default:
                        results.push({ invoiceId, success: false, error: "Invalid operation" });
                        continue;
                }

                invoice.lastModifiedBy = req.user?.id;
                await invoice.save();

                results.push({ invoiceId, success: true });

            } catch (error) {
                results.push({ invoiceId, success: false, error: error.message });
            }
        }

        res.status(200).json({
            message: "Batch operation completed",
            results
        });

    } catch (error) {
        console.error("Batch Update Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get invoice statistics
export const getInvoiceStats = async (req, res) => {
    try {
        const { userId, technicianId, startDate, endDate } = req.query;

        const matchConditions = {};

        if (userId) matchConditions.user = new mongoose.Types.ObjectId(userId);
        if (technicianId) matchConditions.technician = new mongoose.Types.ObjectId(technicianId);

        if (startDate && endDate) {
            matchConditions.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Invoice.aggregate([
            { $match: matchConditions },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    paidAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'paid'] }, '$totalAmount', 0]
                        }
                    },
                    pendingAmount: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['sent', 'viewed']] }, '$totalAmount', 0]
                        }
                    },
                    overdueAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'overdue'] }, '$totalAmount', 0]
                        }
                    }
                }
            }
        ]);

        const statusCounts = await Invoice.aggregate([
            { $match: matchConditions },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            summary: stats[0] || {
                totalInvoices: 0,
                totalAmount: 0,
                paidAmount: 0,
                pendingAmount: 0,
                overdueAmount: 0
            },
            statusBreakdown: statusCounts
        });

    } catch (error) {
        console.error("Get Invoice Stats Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Automatic invoice generation trigger (to be called from booking completion)
export const autoGenerateInvoice = async (bookingId) => {
    try {
        console.log('=== Auto-generating Invoice ===');
        console.log('Booking ID:', bookingId);

        const booking = await Booking.findById(bookingId)
            .populate('user')
            .populate({
                path: 'technician',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            })
            .populate('service');

        if (!booking) {
            console.log('Booking not found');
            return null;
        }

        if (booking.status !== 'completed' && booking.status !== 'accepted') {
            console.log('Booking status is:', booking.status, '- not generating invoice');
            return null;
        }

        console.log('Booking found:', {
            id: booking._id,
            status: booking.status,
            technician: booking.technician?._id,
            service: booking.service?._id,
            user: booking.user?._id
        });

        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ booking: bookingId });
        if (existingInvoice) {
            console.log('Invoice already exists for this booking:', existingInvoice._id);
            return existingInvoice;
        }

        // Validate required data
        if (!booking.user || !booking.service) {
            console.log('Missing user or service data');
            return null;
        }

        // For accepted bookings, technician must be assigned
        // For completed bookings, technician should be assigned but we'll handle it gracefully
        if (booking.status === 'accepted' && !booking.technician) {
            console.log('Technician not assigned for accepted booking - cannot generate invoice');
            return null;
        }

        if (booking.status === 'completed' && !booking.technician) {
            console.log('Technician not assigned for completed booking - proceeding without technician details');
        }

        // Create invoice automatically
        const invoiceData = {
            bookingId,
            items: [{
                description: booking.service.name,
                category: 'labor',
                quantity: 1,
                unitPrice: booking.finalCost || booking.estimatedCost || 0,
                totalPrice: booking.finalCost || booking.estimatedCost || 0,
                taxRate: 15, // Apply 15% VAT to items
                taxAmount: 0 // Will be calculated below
            }],
            taxRates: [{ type: 'VAT', rate: 15 }], // Default 15% VAT
            dueDate: moment().add(30, 'days').toDate(),
            template: 'standard'
        };

        // Use the createInvoice function logic
        const invoiceNumber = await generateInvoiceNumber();
        const invoiceSequence = parseInt(invoiceNumber.split('-')[2]);

        const subtotal = booking.finalCost || booking.estimatedCost || 0;
        const { taxBreakdown, totalTax } = calculateTaxBreakdown(subtotal, invoiceData.taxRates);
        const totalAmount = subtotal + totalTax;

        // Update item tax amounts
        invoiceData.items[0].taxAmount = (invoiceData.items[0].unitPrice * invoiceData.items[0].taxRate) / 100;
        invoiceData.items[0].totalPrice = invoiceData.items[0].unitPrice + invoiceData.items[0].taxAmount;

        const technician = booking.technician; // Already populated from the booking query

        // Debug technician data
        console.log('Auto-invoice technician data:', {
            bookingTechnician: booking.technician,
            technician: technician,
            technicianUser: technician?.user,
            technicianName: technician?.user?.name || technician?.name
        });

        // If technician data is not properly populated, try to fetch it
        let technicianData = technician;
        if (technician && !technician.user && typeof technician === 'string') {
            try {
                technicianData = await Technician.findById(technician).populate('user', 'name email phone');
                console.log('Fetched technician data:', technicianData);
            } catch (error) {
                console.error('Error fetching technician:', error);
            }
        }

        const invoice = new Invoice({
            booking: bookingId,
            invoiceNumber,
            invoiceSequence,
            user: booking.user._id,
            customerDetails: {
                name: booking.user.name,
                email: booking.user.email,
                phone: booking.user.phone,
                billingAddress: {
                    street: booking.address || booking.user.address?.street || 'Service Address Not Provided',
                    city: booking.user.address?.city || 'Dhaka',
                    area: booking.user.address?.area || booking.address || 'Service Area',
                    postalCode: booking.user.address?.postalCode || '1200'
                }
            },
            technician: booking.technician?._id || booking.technician,
            technicianDetails: {
                name: booking.technician?.user?.name || booking.technician?.name || technicianData?.user?.name || technicianData?.name || technician?.user?.name || technician?.name || 'Technician Not Assigned',
                email: booking.technician?.user?.email || booking.technician?.email || technicianData?.user?.email || technicianData?.email || technician?.user?.email || technician?.email || '',
                phone: booking.technician?.user?.phone || booking.technician?.phone || technicianData?.user?.phone || technicianData?.phone || technician?.user?.phone || technician?.phone || '',
                licenseNumber: booking.technician?.licenseNumber || technicianData?.licenseNumber || technician?.licenseNumber || '',
                specialization: booking.technician?.specialization || technicianData?.specialization || technician?.specialization || ''
            },
            service: booking.service._id,
            serviceDetails: {
                name: booking.service.name,
                category: booking.service.category,
                description: booking.description,
                estimatedDuration: booking.service.estimatedDuration
            },
            items: invoiceData.items,
            subtotal,
            taxBreakdown,
            totalTax,
            totalAmount,
            serviceDate: booking.completedAt || booking.createdAt,
            dueDate: invoiceData.dueDate,
            completedAt: booking.completedAt,
            template: invoiceData.template,
            status: booking.status === 'completed' ? 'paid' : 'sent', // Invoice is sent when technician accepts, paid when customer completes
            paymentStatus: booking.status === 'completed' ? 'paid' : 'pending' // Payment is pending until customer confirms completion
        });

        try {
            await invoice.save();
            console.log('Auto-invoice created successfully:', invoice._id);
        } catch (saveError) {
            console.error('Error saving invoice:', saveError);
            return null;
        }

        // Auto-generate PDF
        try {
            const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
            await fs.ensureDir(invoicesDir);

            const pdfFilename = `${invoice.invoiceNumber}.pdf`;
            const pdfPath = path.join(invoicesDir, pdfFilename);

            // Transform invoice data for PDF generation
            const pdfInvoiceData = {
                // Branding information
                branding: {
                    companyName: 'Repair Portal',
                    companyAddress: {
                        street: '123 Service Street',
                        city: 'Dhaka',
                        area: 'Gulshan',
                        country: 'Bangladesh'
                    },
                    companyPhone: '+880 1234-567890',
                    companyEmail: 'support@repairportal.com'
                },

                // Invoice metadata
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate,
                dueDate: invoice.dueDate,
                serviceDate: invoice.serviceDate,

                // Customer details
                customerDetails: {
                    name: invoice.customerDetails?.name || booking.user?.name || 'N/A',
                    email: invoice.customerDetails?.email || booking.user?.email || 'N/A',
                    phone: invoice.customerDetails?.phone || booking.user?.phone || 'N/A',
                    billingAddress: {
                        street: invoice.customerDetails?.billingAddress?.street || booking.address || booking.user?.address?.street || 'N/A',
                        city: invoice.customerDetails?.billingAddress?.city || booking.user?.address?.city || 'Dhaka',
                        area: invoice.customerDetails?.billingAddress?.area || booking.address || booking.user?.address?.area || 'N/A',
                        postalCode: invoice.customerDetails?.billingAddress?.postalCode || booking.user?.address?.postalCode || '1200',
                        country: invoice.customerDetails?.billingAddress?.country || 'Bangladesh'
                    }
                },

                // Technician details
                technicianDetails: {
                    name: invoice.technicianDetails?.name || booking.technician?.user?.name || booking.technician?.name || technicianData?.user?.name || technicianData?.name || technician?.user?.name || technician?.name || 'Technician Not Assigned',
                    email: invoice.technicianDetails?.email || booking.technician?.user?.email || booking.technician?.email || technicianData?.user?.email || technicianData?.email || technician?.user?.email || technician?.email || 'N/A',
                    phone: invoice.technicianDetails?.phone || booking.technician?.user?.phone || booking.technician?.phone || technicianData?.user?.phone || technicianData?.phone || technician?.user?.phone || technician?.phone || 'N/A',
                    specialization: invoice.technicianDetails?.specialization || booking.technician?.specialization || technicianData?.specialization || technician?.specialization || 'N/A',
                    licenseNumber: invoice.technicianDetails?.licenseNumber || booking.technician?.licenseNumber || technicianData?.licenseNumber || technician?.licenseNumber || 'N/A'
                },

                // Service details
                serviceDetails: {
                    name: invoice.serviceDetails?.name || booking.service?.name || 'N/A',
                    category: invoice.serviceDetails?.category || booking.service?.category || 'N/A',
                    description: invoice.serviceDetails?.description || booking.description || 'N/A'
                },

                // Invoice items (sanitize using invoice.items if available)
                items: (invoice.items && invoice.items.length) ? invoice.items.map(it => ({
                    description: it.description,
                    quantity: it.quantity || 1,
                    unitPrice: Number(it.unitPrice || 0),
                    totalPrice: Number(it.totalPrice || 0),
                    taxRate: it.taxRate || 0,
                    taxAmount: Number(it.taxAmount || 0)
                })) : invoiceData.items.map(it => ({
                    description: it.description,
                    quantity: it.quantity || 1,
                    unitPrice: Number(it.unitPrice || 0),
                    totalPrice: Number(it.totalPrice || 0),
                    taxRate: it.taxRate || 0,
                    taxAmount: Number(it.taxAmount || 0)
                })),

                // Financial information (use saved invoice totals when present)
                subtotal: Number(invoice.subtotal || subtotal || 0),
                discount: invoice.discount || { amount: 0, type: 'fixed' },
                totalTax: Number(invoice.totalTax || totalTax || 0),
                totalAmount: Number(invoice.totalAmount || totalAmount || 0),
                currency: invoice.currency || { code: 'USD', symbol: '$' },

                // Template and additional info
                template: invoice.template || 'standard',
                termsAndConditions: invoice.termsAndConditions || 'Payment is due within 30 days. Late payments may incur additional charges.',
                notes: invoice.notes || ''
            };

            await PDFGenerator.generateInvoicePDF(pdfInvoiceData, pdfPath, invoice.template);

            invoice.pdfPath = pdfPath;
            invoice.pdfUrl = `/uploads/invoices/${pdfFilename}`;
            invoice.pdfGeneratedAt = new Date();
            await invoice.save();

            console.log('Auto-PDF generated successfully');
        } catch (pdfError) {
            console.error('Error generating auto-PDF:', pdfError);
        }

        return invoice;

    } catch (error) {
        console.error("Auto-generate Invoice Error:", error);
        return null;
    }
};

// Mark invoice as paid when customer confirms completion
export const markInvoiceAsPaid = async (req, res) => {
    try {
        const { bookingId } = req.params;

        console.log('=== Marking Invoice as Paid ===');
        console.log('Booking ID:', bookingId);

        // Find invoice by booking ID
        const invoice = await Invoice.findOne({ booking: bookingId });

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found for this booking" });
        }

        // Update invoice status
        invoice.status = 'paid';
        invoice.paymentStatus = 'paid';
        invoice.paymentDate = new Date();

        // Add to status history
        invoice.statusHistory.push({
            status: 'paid',
            timestamp: new Date(),
            by: req.user?.id || invoice.user,
            notes: 'Payment confirmed by customer'
        });

        await invoice.save();

        console.log('Invoice marked as paid successfully');

        res.status(200).json({
            message: "Invoice marked as paid successfully",
            invoice
        });

    } catch (error) {
        console.error("Mark Invoice as Paid Error:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

