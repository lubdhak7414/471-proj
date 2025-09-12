// warranty.controller.js
import Warranty from "../models/warranty.model.js";
import Booking from "../models/booking.model.js";
import Invoice from "../models/invoice.model.js";
import Technician from "../models/technician.model.js";
import fs from 'fs-extra';
import path from 'path';
import PDFDocument from 'pdfkit';

// Generate warranty number helper
const generateWarrantyNumber = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `WAR-${timestamp}-${randomStr}`.toUpperCase();
};

// Create warranty card
export const autoCreateWarranty = async (bookingId) => {
    // Programmatic creation used by booking completion flow
    const booking = await Booking.findById(bookingId)
        .populate('user')
        .populate({ path: 'technician', populate: { path: 'user', select: 'name email phone' } })
        .populate('service');

    if (!booking || booking.status !== 'completed') {
        return null;
    }

    const invoice = await Invoice.findOne({ booking: bookingId });
    if (!invoice) return null;

    // Avoid duplicate warranties
    const existingWarranty = await Warranty.findOne({ booking: bookingId });
    if (existingWarranty) return existingWarranty;

    const warrantyNumber = generateWarrantyNumber();

    const getWarrantyPeriod = (category) => {
        const periods = {
            'electronics': { duration: 90, unit: 'days' },
            'appliances': { duration: 6, unit: 'months' },
            'plumbing': { duration: 30, unit: 'days' },
            'electrical': { duration: 60, unit: 'days' }
        };
        return periods[category] || { duration: 30, unit: 'days' };
    };

    const warrantyPeriod = getWarrantyPeriod(booking.service.category);

    const warranty = new Warranty({
        booking: bookingId,
        invoice: invoice._id,
        warrantyNumber,
        user: booking.user._id,
        technician: booking.technician?._id || null,
        service: {
            name: booking.service.name,
            category: booking.service.category
        },
        warrantyPeriod,
        coverageDetails: [
            { item: 'Parts Replacement', description: 'Defective parts will be replaced free of charge', covered: true },
            { item: 'Labor Charges', description: 'Labor costs for warranty repairs', covered: true }
        ],
        terms: [
            'Warranty is valid only for defects in workmanship',
            'Physical damage or misuse voids warranty',
            'Original invoice must be presented for warranty claims',
            'Warranty is non-transferable'
        ],
        serviceDate: booking.completedAt,
        qrCode: `warranty-${warrantyNumber}`
    });

    await warranty.save();

    // Try to generate a PDF and store locally
    try {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'warranties');
        await fs.ensureDir(uploadsDir);
        const filename = `${warranty.warrantyNumber}.pdf`;
        const filePath = path.join(uploadsDir, filename);

        // Create a simple PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(20).text('Warranty Certificate', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Warranty Number: ${warranty.warrantyNumber}`);
        doc.text(`Service: ${warranty.service.name} (${warranty.service.category})`);
        doc.text(`Service Date: ${warranty.serviceDate ? warranty.serviceDate.toDateString() : ''}`);
        doc.text(`Warranty Period: ${warranty.warrantyPeriod.duration} ${warranty.warrantyPeriod.unit}`);
        doc.moveDown();
        doc.text('Coverage:');
        warranty.coverageDetails.forEach(cd => {
            doc.text(`- ${cd.item}: ${cd.description} (${cd.covered ? 'Covered' : 'Not Covered'})`);
        });

        doc.moveDown();
        doc.text('Terms & Conditions:');
        warranty.terms.forEach(t => doc.text(`- ${t}`));

        doc.end();

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        const pdfUrl = `/uploads/warranties/${filename}`;
        warranty.pdfUrl = pdfUrl;
        await warranty.save();
    } catch (pdfErr) {
        console.error('Failed to generate warranty PDF:', pdfErr);
    }

    return warranty;
};

export const createWarranty = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const warranty = await autoCreateWarranty(bookingId);
        if (!warranty) {
            return res.status(400).json({ message: 'Unable to create warranty for this booking' });
        }
        res.status(201).json({ message: 'Warranty created', warranty });
    } catch (error) {
        console.error('Create Warranty Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get warranty by ID
export const getWarrantyById = async (req, res) => {
    try {
        const warranty = await Warranty.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('technician')
            .populate('booking')
            .populate('invoice');

        if (!warranty) {
            return res.status(404).json({ message: "Warranty not found" });
        }

        res.status(200).json(warranty);
    } catch (error) {
        console.error("Get Warranty Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get user warranties
export const getUserWarranties = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status = 'active' } = req.query;

        const query = { user: userId };
        
        if (status === 'active') {
            query.isActive = true;
            query.expiryDate = { $gt: new Date() };
        } else if (status === 'expired') {
            query.expiryDate = { $lt: new Date() };
        }

        const warranties = await Warranty.find(query)
            .populate('technician', 'user')
            .populate('booking', 'service completedAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Warranty.countDocuments(query);

        res.status(200).json({
            warranties,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Get User Warranties Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Create warranty claim
export const createWarrantyClaim = async (req, res) => {
    try {
        const { warrantyId } = req.params;
        const { description } = req.body;

        const warranty = await Warranty.findById(warrantyId);
        if (!warranty) {
            return res.status(404).json({ message: "Warranty not found" });
        }

        // Check if warranty is still active
        if (!warranty.isActive || warranty.expiryDate < new Date()) {
            return res.status(400).json({ message: "Warranty has expired" });
        }

        // Add claim to warranty history
        warranty.claimsHistory.push({
            claimDate: new Date(),
            description,
            status: 'pending'
        });

        await warranty.save();

        res.status(200).json({
            message: "Warranty claim submitted successfully",
            warranty
        });
    } catch (error) {
        console.error("Create Warranty Claim Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Generate warranty PDF
export const generateWarrantyPDF = async (req, res) => {
    try {
        const { warrantyId } = req.params;
        
        const warranty = await Warranty.findById(warrantyId)
            .populate('user', 'name email phone')
            .populate('technician')
            .populate('booking');

        if (!warranty) {
            return res.status(404).json({ message: "Warranty not found" });
        }

        // Mock PDF generation
        const pdfUrl = `https://your-cdn.com/warranties/${warranty.warrantyNumber}.pdf`;
        
        await Warranty.findByIdAndUpdate(warrantyId, { pdfUrl });

        res.status(200).json({
            message: "Warranty PDF generated successfully",
            pdfUrl,
            warranty
        });
    } catch (error) {
        console.error("Generate Warranty PDF Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
