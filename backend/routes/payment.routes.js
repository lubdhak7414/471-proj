import express from "express";
import {
    createPayment,
    processPayment,
    getPaymentByBooking
} from "../controllers/payment.controller.js";

const router = express.Router();

// Create payment
router.post("/", createPayment);

// Process payment
router.put("/:paymentId/process", processPayment);

// Get payment by booking
router.get("/booking/:bookingId", getPaymentByBooking);

export default router;
