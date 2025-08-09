// warranty.model.js
import mongoose from "mongoose";

const warrantySchema = new mongoose.Schema(
	{
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Booking",
			required: true,
		},
		invoice: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Invoice",
			required: true,
		},
		warrantyNumber: {
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
			category: { type: String, required: true },
		},
		warrantyPeriod: {
			duration: { type: Number, required: true }, // in days
			unit: { type: String, enum: ["days", "months", "years"], default: "days" },
		},
		warrantyType: {
			type: String,
			enum: ["parts", "labor", "full-service"],
			default: "full-service",
		},
		coverageDetails: [{
			item: { type: String, required: true },
			description: { type: String },
			covered: { type: Boolean, default: true },
		}],
		terms: [{
			type: String, // Array of warranty terms and conditions
		}],
		serviceDate: {
			type: Date,
			required: true,
		},
		expiryDate: {
			type: Date,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		claimsHistory: [{
			claimDate: { type: Date },
			description: { type: String },
			status: { type: String, enum: ["pending", "approved", "rejected", "completed"] },
			resolution: { type: String },
		}],
		digitalSignature: {
			technicianSignature: { type: String }, // Base64 or URL
			customerSignature: { type: String },
		},
		qrCode: {
			type: String, // QR code for easy verification
		},
		pdfUrl: {
			type: String, // URL to generated warranty card PDF
		},
	},
	{
		timestamps: true,
	}
);

// Auto-calculate expiry date before saving
warrantySchema.pre('save', function(next) {
	if (this.serviceDate && this.warrantyPeriod.duration) {
		const expiryDate = new Date(this.serviceDate);
		const unit = this.warrantyPeriod.unit;
		const duration = this.warrantyPeriod.duration;
		
		if (unit === 'days') {
			expiryDate.setDate(expiryDate.getDate() + duration);
		} else if (unit === 'months') {
			expiryDate.setMonth(expiryDate.getMonth() + duration);
		} else if (unit === 'years') {
			expiryDate.setFullYear(expiryDate.getFullYear() + duration);
		}
		
		this.expiryDate = expiryDate;
	}
	next();
});

const Warranty = mongoose.model("Warranty", warrantySchema);
export default Warranty;