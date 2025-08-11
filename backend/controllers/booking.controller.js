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
