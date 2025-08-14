import express from "express";
import {
    createBid,
    getBookingBids,
    acceptBid,
    getTechnicianBids
} from "../controllers/bid.controller.js";

const router = express.Router();

// Create bid
router.post("/", createBid);

// Get bids for a booking
router.get("/booking/:bookingId", getBookingBids);

// Accept a bid
router.put("/:bidId/accept", acceptBid);

// Get technician's bids
router.get("/technician/:technicianId", getTechnicianBids);

export default router;
