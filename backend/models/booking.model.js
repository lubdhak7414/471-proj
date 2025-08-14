// booking.model.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        technician: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Technician",
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [{
            type: String,
        }],
        preferredDate: {
            type: Date,
            required: true,
        },
        preferredTime: {
            type: String,
            required: true,
        },
        urgency: {
            type: String,
            enum: ["low", "medium", "high", "emergency"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
            default: "pending",
        },
        address: {
            type: String,
            default: null,
        },
        estimatedCost: {
            type: Number,
        },
        finalCost: {
            type: Number,
        },
        completedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancellationReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;