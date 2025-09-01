import express from "express";
import {
    createBooking,
    getBookingById,
    updateBooking,
    deleteBooking,
    getAllBookings,
    cancelBooking,
    rescheduleBooking,
    getBookingHistory,
    getUserCancellableBookings,
    bulkCancelBookings,
    getBookingStatus
    getUserBookings
} from "../controllers/booking.controller.js";

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
router.post("/", createBooking);

// @route   GET /api/bookings/:id
// @desc    Get a booking by ID
router.get("/:id", getBookingById);

// @route   PUT /api/bookings/:id
// @desc    Update a booking by ID
router.put("/:id", updateBooking);

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking by ID
router.delete("/:id", deleteBooking);

// @route   GET /api/bookings
// @desc    Get all bookings
router.get("/", getAllBookings);

router.put('/cancel/:id', cancelBooking);
router.put('/reschedule/:id', rescheduleBooking);
router.get('/history/:id', getBookingHistory);
router.get('/user/:userId/cancellable', getUserCancellableBookings);
router.put('/bulk-cancel', bulkCancelBookings);
router.get("/status/:id", getBookingStatus);
router.get("/user/:userId", getUserBookings);

export default router;
