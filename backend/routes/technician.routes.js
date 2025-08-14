import express from "express";
import {
    createTechnician,
    searchTechnicians,
    getTechnicianById,
    getTechnicianDashboard,
    updateBookingStatus
} from "../controllers/technician.controller.js";

const router = express.Router();

// Create technician profile
router.post("/", createTechnician);

// Search technicians
router.get("/search", searchTechnicians);

// Get technician by ID
router.get("/:id", getTechnicianById);

// Get technician dashboard data
router.get("/:technicianId/dashboard", getTechnicianDashboard);

// Accept/Reject booking
router.put("/bookings/:bookingId/status", updateBookingStatus);

export default router;
