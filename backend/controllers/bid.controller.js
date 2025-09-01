import Bid from "../models/bid.model.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";

// Create bid on booking
export const createBid = async (req, res) => {
    try {
        const { booking, technician, bidAmount, message, estimatedDuration } = req.body;

        console.log("➡️ Received Bid Payload:", { booking, technician, bidAmount, message, estimatedDuration });

        // Validate booking
// Check if booking exists and is open for bidding
        const existingBooking = await Booking.findById(booking);
        console.log("🔍 Booking lookup result:", existingBooking);

        if (!existingBooking || !['pending', 'bidding'].includes(existingBooking.status.toLowerCase())) {
            console.warn("❌ Booking invalid or not open for bidding:", {
                exists: !!existingBooking,
                status: existingBooking?.status
            });
            return res.status(400).json({ 
                message: "Booking not available for bidding" 
            });
        }

        // Validate technician
        const user = await User.findById(technician);
        console.log("🔍 Technician lookup result:", user);

        if (!user || user.role !== 'technician') {
            console.warn("❌ User not a technician or not found:", {
                exists: !!user,
                role: user?.role
            });
            return res.status(400).json({
                message: "Technician not found or not authorized to bid"
            });
        }

        // Check for existing bid
        const existingBid = await Bid.findOne({ booking, technician });
        console.log("🔍 Existing bid check:", existingBid);

        if (existingBid) {
            console.warn("❌ Duplicate bid attempt:", existingBid._id);
            return res.status(400).json({ 
                message: "You have already placed a bid on this booking" 
            });
        }

        // Create bid
        const bid = new Bid({
            booking,
            technician,
            bidAmount,
            message,
            estimatedDuration
        });

        await bid.save();
        console.log("✅ Bid saved successfully:", bid._id);

        const populatedBid = await Bid.findById(bid._id)
            .populate('technician', 'name picture phone')
            .populate('booking', 'service description');

        res.status(201).json({
            message: "Bid placed successfully",
            bid: populatedBid
        });

    } catch (error) {
        console.error("🔥 Create Bid Error:", error.stack || error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get bids for booking
export const getBookingBids = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { sortBy = 'bidAmount' } = req.query;

        console.log("➡️ Get Booking Bids - Params:", { bookingId, sortBy });

        const sortOptions = {
            'bidAmount': { bidAmount: 1 },
            'rating': { 'technicianInfo.rating.average': -1 },
            'experience': { 'technicianInfo.totalJobs': -1 },
            'createdAt': { createdAt: 1 }
        };

        const bids = await Bid.find({ booking: bookingId, status: 'pending' })
        .populate({
            path: 'technician', // Populate directly from 'technician'
            select: 'name picture phone' // Fields to return
        })
        .sort(sortOptions[sortBy] || { bidAmount: 1 });


        console.log(`✅ Found ${bids.length} bids for booking ${bookingId}`);

        res.status(200).json({
            bids,
            count: bids.length
        });
    } catch (error) {
        console.error("🔥 Get Booking Bids Error:", error.stack || error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Accept bid
export const acceptBid = async (req, res) => {
    try {
        const { bidId } = req.params;

        console.log("➡️ Accept Bid - Params:", { bidId });

        // Find the bid using the provided bidId
        const bid = await Bid.findById(bidId).populate('booking');
        console.log("🔍 Found bid:", bid);

        if (!bid) {
            console.warn("❌ Bid not found:", bidId);
            return res.status(404).json({ message: "Bid not found" });
        }

        // Reject all other bids for this booking
        await Bid.updateMany(
            { booking: bid.booking._id, _id: { $ne: bidId } },
            { status: 'rejected' }
        );
        console.log("✅ Other bids rejected");

        // Accept the selected bid
        await Bid.findByIdAndUpdate(bidId, { 
            status: 'accepted',
            acceptedAt: new Date()
        });
        console.log("✅ Bid marked as accepted");

        // Update booking with technician and cost details
        await Booking.findByIdAndUpdate(bid.booking._id, {
            technician: bid.technician,
            estimatedCost: bid.bidAmount,
            status: 'accepted'
        });
        console.log("✅ Booking updated with accepted bid");

        res.status(200).json({
            message: "Bid accepted successfully",
            bidId: bid._id
        });
    } catch (error) {
        console.error("🔥 Accept Bid Error:", error.stack || error);
        res.status(500).json({ message: "Server Error" });
    }
};


// Get technician's bids
export const getTechnicianBids = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        console.log("➡️ Get Technician Bids - Params:", {
            technicianId, status, page, limit
        });

        const technician = await User.findById(technicianId);
        console.log("🔍 Technician lookup result:", technician);

        if (!technician || technician.role !== 'technician') {
            console.warn("❌ Invalid technician ID or role:", {
                exists: !!technician,
                role: technician?.role
            });
            return res.status(400).json({
                message: "User is not a technician"
            });
        }

        const query = { technician: technicianId };
        if (status) {
            query.status = status;
        }

        const bids = await Bid.find(query)
            .populate('booking', 'service description user preferredDate')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Bid.countDocuments(query);

        console.log(`✅ Fetched ${bids.length} bids out of ${total} total`);

        res.status(200).json({
            bids,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        console.error("🔥 Get Technician Bids Error:", error.stack || error);
        res.status(500).json({ message: "Server Error" });
    }
};
