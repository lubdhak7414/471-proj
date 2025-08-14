import Bid from "../models/bid.model.js";

// Create bid on booking
export const createBid = async (req, res) => {
    try {
        const { booking, technician, bidAmount, message, estimatedDuration } = req.body;

        // Check if booking exists and is open for bidding
        const existingBooking = await Booking.findById(booking);
        if (!existingBooking || existingBooking.status !== 'pending') {
            return res.status(400).json({ 
                message: "Booking not available for bidding" 
            });
        }

        // Check if technician already bid on this booking
        const existingBid = await Bid.findOne({ booking, technician });
        if (existingBid) {
            return res.status(400).json({ 
                message: "You have already placed a bid on this booking" 
            });
        }

        const bid = new Bid({
            booking,
            technician,
            bidAmount,
            message,
            estimatedDuration
        });

        await bid.save();

        const populatedBid = await Bid.findById(bid._id)
            .populate('technician', 'user rating totalJobs')
            .populate('booking', 'service description');

        res.status(201).json({
            message: "Bid placed successfully",
            bid: populatedBid
        });
    } catch (error) {
        console.error("Create Bid Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get bids for booking
export const getBookingBids = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { sortBy = 'bidAmount' } = req.query;

        const sortOptions = {
            'bidAmount': { bidAmount: 1 },
            'rating': { 'technicianInfo.rating.average': -1 },
            'experience': { 'technicianInfo.totalJobs': -1 },
            'createdAt': { createdAt: 1 }
        };

        const bids = await Bid.find({ booking: bookingId, status: 'pending' })
            .populate({
                path: 'technician',
                populate: {
                    path: 'user',
                    select: 'name picture phone'
                }
            })
            .sort(sortOptions[sortBy] || { bidAmount: 1 });

        res.status(200).json({
            bids,
            count: bids.length
        });
    } catch (error) {
        console.error("Get Booking Bids Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Accept bid
export const acceptBid = async (req, res) => {
    try {
        const { bidId } = req.params;
        const { userId } = req.body;

        const bid = await Bid.findById(bidId).populate('booking');
        if (!bid) {
            return res.status(404).json({ message: "Bid not found" });
        }

        // Verify user owns the booking
        if (bid.booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Accept the bid and reject others
        await Bid.updateMany(
            { booking: bid.booking._id, _id: { $ne: bidId } },
            { status: 'rejected' }
        );

        await Bid.findByIdAndUpdate(bidId, { 
            status: 'accepted',
            acceptedAt: new Date()
        });

        // Update booking with selected technician and estimated cost
        await Booking.findByIdAndUpdate(bid.booking._id, {
            technician: bid.technician,
            estimatedCost: bid.bidAmount,
            status: 'accepted'
        });

        res.status(200).json({
            message: "Bid accepted successfully",
            bidId: bid._id
        });
    } catch (error) {
        console.error("Accept Bid Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get technician's bids
export const getTechnicianBids = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

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

        res.status(200).json({
            bids,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Get Technician Bids Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};