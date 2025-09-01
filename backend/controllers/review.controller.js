// review.controller.js
import Review from "../models/review.model.js";

// Create review
export const createReview = async (req, res) => {
    try {
        const {
            booking,
            user,
            technician,
            rating,
            comment,
            images,
            wouldRecommend,
            isAnonymous
        } = req.body;

        // Check if booking is completed
        const existingBooking = await Booking.findById(booking);
        if (!existingBooking || existingBooking.status !== 'completed') {
            return res.status(400).json({ 
                message: "Can only review completed bookings" 
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ booking });
        if (existingReview) {
            return res.status(400).json({ 
                message: "Review already exists for this booking" 
            });
        }

        const review = new Review({
            booking,
            user,
            technician,
            rating,
            comment,
            images,
            wouldRecommend,
            isAnonymous
        });

        await review.save();

        // Update technician's average rating
        await updateTechnicianRating(technician);

        res.status(201).json({
            message: "Review created successfully",
            review
        });
    } catch (error) {
        console.error("Create Review Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update technician rating helper function
const updateTechnicianRating = async (technicianId) => {
    try {
        const reviews = await Review.find({ technician: technicianId });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        await Technician.findByIdAndUpdate(technicianId, {
            'rating.average': averageRating,
            'rating.count': reviews.length
        });
    } catch (error) {
        console.error("Update Technician Rating Error:", error);
    }
};

// Get reviews for technician
export const getTechnicianReviews = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ 
            technician: technicianId, 
            isVisible: true 
        })
        .populate('user', 'name picture')
        .populate('booking', 'service completedAt')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ 
            technician: technicianId, 
            isVisible: true 
        });

        res.status(200).json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Get Technician Reviews Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Technician respond to review
export const respondToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { comment, technicianId } = req.body;

        const review = await Review.findOneAndUpdate(
            { _id: reviewId, technician: technicianId },
            {
                'technicianResponse.comment': comment,
                'technicianResponse.respondedAt': new Date()
            },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({
            message: "Response added successfully",
            review
        });
    } catch (error) {
        console.error("Respond to Review Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

