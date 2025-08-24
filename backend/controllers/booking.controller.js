import Booking from "../models/booking.model.js";

// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const {
            user,
            technician,
            service,
            description,
            images,
            preferredDate,
            preferredTime,
            urgency,
            address,
            estimatedCost
        } = req.body;

        const booking = new Booking({
            user,
            technician,
            service,
            description,
            images,
            preferredDate,
            preferredTime,
            urgency,
            address,
            estimatedCost
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("user")
            .populate("technician")
            .populate("service");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error("Get Booking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update booking
export const updateBooking = async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error("Update Booking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete booking
export const deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Delete Booking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("user")
            .populate("technician")
            .populate("service");

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Get All Bookings Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;

        // Find the booking
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking can be cancelled
        if (booking.status === "completed") {
            return res.status(400).json({ 
                message: "Cannot cancel a completed booking" 
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ 
                message: "Booking is already cancelled" 
            });
        }

        // Update booking status to cancelled
        const cancelledBooking = await Booking.findByIdAndUpdate(
            id,
            {
                status: "cancelled",
                cancellationReason: cancellationReason || "Cancelled by user",
                cancelledAt: new Date()
            },
            { new: true }
        ).populate("user").populate("technician").populate("service");

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking: cancelledBooking
        });

    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Reschedule booking
export const rescheduleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { preferredDate, preferredTime, rescheduleReason } = req.body;

        // Validate required fields
        if (!preferredDate || !preferredTime) {
            return res.status(400).json({ 
                message: "Preferred date and time are required for rescheduling" 
            });
        }

        // Find the booking
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking can be rescheduled
        if (booking.status === "completed") {
            return res.status(400).json({ 
                message: "Cannot reschedule a completed booking" 
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ 
                message: "Cannot reschedule a cancelled booking" 
            });
        }

        // Validate new date is in the future
        const newDate = new Date(preferredDate);
        const currentDate = new Date();
        if (newDate <= currentDate) {
            return res.status(400).json({ 
                message: "New preferred date must be in the future" 
            });
        }

        // Store old scheduling info for reference
        const oldPreferredDate = booking.preferredDate;
        const oldPreferredTime = booking.preferredTime;

        // Update booking with new schedule
        const rescheduledBooking = await Booking.findByIdAndUpdate(
            id,
            {
                preferredDate: newDate,
                preferredTime,
                status: booking.status === "accepted" ? "pending" : booking.status, // Reset to pending if it was accepted
                $push: {
                    rescheduleHistory: {
                        oldDate: oldPreferredDate,
                        oldTime: oldPreferredTime,
                        newDate: newDate,
                        newTime: preferredTime,
                        reason: rescheduleReason || "Rescheduled by user",
                        rescheduledAt: new Date()
                    }
                }
            },
            { new: true }
        ).populate("user").populate("technician").populate("service");

        res.status(200).json({
            message: "Booking rescheduled successfully",
            booking: rescheduledBooking
        });

    } catch (error) {
        console.error("Reschedule Booking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get booking cancellation/reschedule history
export const getBookingHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate("user", "name email phone")
            .populate("technician")
            .populate("service", "name category");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const history = {
            bookingId: booking._id,
            currentStatus: booking.status,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            cancellation: booking.status === "cancelled" ? {
                cancelledAt: booking.cancelledAt,
                reason: booking.cancellationReason
            } : null,
            rescheduleHistory: booking.rescheduleHistory || [],
            completion: booking.status === "completed" ? {
                completedAt: booking.completedAt
            } : null
        };

        res.status(200).json(history);

    } catch (error) {
        console.error("Get Booking History Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get user's cancellable bookings
export const getUserCancellableBookings = async (req, res) => {
    try {
        const { userId } = req.params;

        const cancellableBookings = await Booking.find({
            user: userId,
            status: { $nin: ["completed", "cancelled"] }
        })
        .populate("technician", "user rating")
        .populate("service", "name category estimatedPrice")
        .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Cancellable bookings retrieved successfully",
            count: cancellableBookings.length,
            bookings: cancellableBookings
        });

    } catch (error) {
        console.error("Get Cancellable Bookings Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Bulk cancel bookings (admin feature)
export const bulkCancelBookings = async (req, res) => {
    try {
        const { bookingIds, reason } = req.body;

        if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
            return res.status(400).json({ 
                message: "Booking IDs array is required and cannot be empty" 
            });
        }

        // Find bookings that can be cancelled
        const bookings = await Booking.find({
            _id: { $in: bookingIds },
            status: { $nin: ["completed", "cancelled"] }
        });

        if (bookings.length === 0) {
            return res.status(400).json({ 
                message: "No cancellable bookings found" 
            });
        }

        // Bulk update
        const result = await Booking.updateMany(
            {
                _id: { $in: bookings.map(b => b._id) },
                status: { $nin: ["completed", "cancelled"] }
            },
            {
                status: "cancelled",
                cancellationReason: reason || "Bulk cancellation",
                cancelledAt: new Date()
            }
        );

        res.status(200).json({
            message: `${result.modifiedCount} bookings cancelled successfully`,
            cancelledCount: result.modifiedCount,
            requestedCount: bookingIds.length
        });

    } catch (error) {
        console.error("Bulk Cancel Bookings Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all bookings for a specific user
export const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;

        const bookings = await Booking.find({ user: userId })
            .populate("technician")
            .populate("service")
            .sort({ createdAt: -1 });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this user" });
        }

        res.status(200).json({
            message: "Bookings retrieved successfully",
            count: bookings.length,
            bookings: bookings
        });

    } catch (error) {
        console.error("Get User Bookings Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};