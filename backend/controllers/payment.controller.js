// payment.controller.js
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";

// Create payment
export const createPayment = async (req, res) => {
    try {
        const {
            booking,
            user,
            technician,
            amount,
            paymentMethod
        } = req.body;

        // Verify booking exists and is completed
        const existingBooking = await Booking.findById(booking);
        if (!existingBooking || existingBooking.status !== 'completed') {
            return res.status(400).json({ 
                message: "Booking not found or not completed" 
            });
        }

        const platformFeeRate = 0.05; // 5% platform fee
        const platformFee = amount * platformFeeRate;
        const technicianAmount = amount - platformFee;

        const payment = new Payment({
            booking,
            user,
            technician,
            amount,
            paymentMethod,
            platformFee,
            technicianAmount
        });

        await payment.save();

        res.status(201).json({
            message: "Payment initiated successfully",
            payment
        });
    } catch (error) {
        console.error("Create Payment Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Process payment (mock gateway integration)
export const processPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { transactionId, gatewayResponse } = req.body;

        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            {
                status: 'completed',
                transactionId,
                gatewayResponse,
                paidAt: new Date()
            },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json({
            message: "Payment processed successfully",
            payment
        });
    } catch (error) {
        console.error("Process Payment Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get payment by booking
export const getPaymentByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const payment = await Payment.findOne({ booking: bookingId })
            .populate('user', 'name email')
            .populate('technician')
            .populate('booking');

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Get Payment Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

