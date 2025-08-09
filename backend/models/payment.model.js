// payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Booking",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		technician: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Technician",
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		paymentMethod: {
			type: String,
			enum: ["bkash", "nagad", "rocket", "card", "cash"],
			required: true,
		},
		transactionId: {
			type: String,
			unique: true,
			sparse: true,
		},
		gatewayResponse: {
			type: mongoose.Schema.Types.Mixed,
		},
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed", "refunded"],
			default: "pending",
		},
		paidAt: {
			type: Date,
		},
		refundedAt: {
			type: Date,
		},
		refundAmount: {
			type: Number,
			default: 0,
		},
		platformFee: {
			type: Number,
			default: 0,
		},
		technicianAmount: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;