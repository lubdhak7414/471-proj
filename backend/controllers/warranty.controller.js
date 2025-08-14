// warranty.controller.js
import Warranty from "../models/warranty.model.js";

// Generate warranty number helper
const generateWarrantyNumber = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `WAR-${timestamp}-${randomStr}`.toUpperCase();
};

// Create warranty card
export const createWarranty = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // Get booking and invoice
        const booking = await Booking.findById(bookingId)
            .populate('user')
            .populate('technician')
            .populate('service');

        if (!booking || booking.status !== 'completed') {
            return res.status(400).json({ 
                message: "Booking not found or not completed" 
            });
        }

        const invoice = await Invoice.findOne({ booking: bookingId });
        if (!invoice) {
            return res.status(400).json({ 
                message: "Invoice not found for this booking" 
            });
        }

        // Check if warranty already exists
        const existingWarranty = await Warranty.findOne({ booking: bookingId });
        if (existingWarranty) {
            return res.status(400).json({ 
                message: "Warranty already exists for this booking" 
            });
        }

        const warrantyNumber = generateWarrantyNumber();
        
        // Default warranty terms based on service category
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
            technician: booking.technician._id,
            service: {
                name: booking.service.name,
                category: booking.service.category
            },
            warrantyPeriod,
            coverageDetails: [
                {
                    item: "Parts Replacement",
                    description: "Defective parts will be replaced free of charge",
                    covered: true
                },
                {
                    item: "Labor Charges",
                    description: "Labor costs for warranty repairs",
                    covered: true
                }
            ],
            terms: [
                "Warranty is valid only for defects in workmanship",
                "Physical damage or misuse voids warranty",
                "Original invoice must be presented for warranty claims",
                "Warranty is non-transferable"
            ],
            serviceDate: booking.completedAt,
            qrCode: `warranty-${warrantyNumber}` // Mock QR code
        });

        await warranty.save();

        res.status(201).json({
            message: "Warranty card created successfully",
            warranty
        });
    } catch (error) {
        console.error("Create Warranty Error:", error);
        res.status(500).json({ message: "Server Error" });
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

