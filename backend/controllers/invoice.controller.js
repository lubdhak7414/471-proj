// invoice.controller.js
import Invoice from "../models/invoice.model.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";

// Generate invoice number helper
const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `INV-${timestamp}-${randomStr}`.toUpperCase();
};

// Create invoice
export const createInvoice = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // Get booking with all related data
        const booking = await Booking.findById(bookingId)
            .populate('user')
            .populate('technician')
            .populate('service');

        if (!booking || booking.status !== 'completed') {
            return res.status(400).json({ 
                message: "Booking not found or not completed" 
            });
        }

        // Check if payment exists
        const payment = await Payment.findOne({ booking: bookingId });
        if (!payment) {
            return res.status(400).json({ 
                message: "Payment not found for this booking" 
            });
        }

        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ booking: bookingId });
        if (existingInvoice) {
            return res.status(400).json({ 
                message: "Invoice already exists for this booking" 
            });
        }

        const invoiceNumber = generateInvoiceNumber();
        
        const invoice = new Invoice({
            booking: bookingId,
            payment: payment._id,
            invoiceNumber,
            user: booking.user._id,
            technician: booking.technician._id,
            service: {
                name: booking.service.name,
                description: booking.description
            },
            itemsBreakdown: [{
                description: booking.service.name,
                quantity: 1,
                unitPrice: booking.finalCost,
                totalPrice: booking.finalCost
            }],
            subtotal: booking.finalCost,
            platformFee: payment.platformFee,
            totalAmount: booking.finalCost,
            billingAddress: booking.address,
            serviceDate: booking.completedAt
        });

        await invoice.save();

        res.status(201).json({
            message: "Invoice created successfully",
            invoice
        });
    } catch (error) {
        console.error("Create Invoice Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('technician')
            .populate('booking');

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
        const { page = 1, limit = 10, status } = req.query;

        const query = { user: userId };
        if (status) {
            query.status = status;
        }

        const invoices = await Invoice.find(query)
            .populate('technician', 'user')
            .populate('booking', 'service completedAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Invoice.countDocuments(query);

        res.status(200).json({
            invoices,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Get User Invoices Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Generate PDF invoice (mock implementation)
export const generateInvoicePDF = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        
        const invoice = await Invoice.findById(invoiceId)
            .populate('user', 'name email phone')
            .populate('technician')
            .populate('booking');

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Mock PDF generation - In real implementation, use libraries like puppeteer or jsPDF
        const pdfUrl = `https://your-cdn.com/invoices/${invoice.invoiceNumber}.pdf`;
        
        await Invoice.findByIdAndUpdate(invoiceId, { pdfUrl });

        res.status(200).json({
            message: "PDF generated successfully",
            pdfUrl,
            invoice
        });
    } catch (error) {
        console.error("Generate PDF Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

