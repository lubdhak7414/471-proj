// invoice.model.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
	{
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Booking",
			required: true,
		},
		payment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
			required: true,
		},
		invoiceNumber: {
			type: String,
			required: true,
			unique: true,
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
		service: {
			name: { type: String, required: true },
			description: { type: String, required: true },
		},
		itemsBreakdown: [{
			description: { type: String, required: true },
			quantity: { type: Number, default: 1 },
			unitPrice: { type: Number, required: true },
			totalPrice: { type: Number, required: true },
		}],
		subtotal: {
			type: Number,
			required: true,
		},
		platformFee: {
			type: Number,
			default: 0,
		},
		tax: {
			type: Number,
			default: 0,
		},
		discount: {
			type: Number,
			default: 0,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		billingAddress: {
			street: { type: String, required: true },
			city: { type: String, required: true },
			area: { type: String, required: true },
			postalCode: { type: String },
		},
		serviceDate: {
			type: Date,
			required: true,
		},
		pdfUrl: {
			type: String, // URL to generated PDF
		},
		status: {
			type: String,
			enum: ["draft", "sent", "paid", "overdue", "cancelled"],
			default: "sent",
		},
	},
	{
		timestamps: true,
	}
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;