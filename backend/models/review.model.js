// review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
		rating: {
			overall: { type: Number, required: true, min: 1, max: 5 },
			punctuality: { type: Number, min: 1, max: 5 },
			workQuality: { type: Number, min: 1, max: 5 },
			communication: { type: Number, min: 1, max: 5 },
			cleanliness: { type: Number, min: 1, max: 5 },
		},
		comment: {
			type: String,
			maxlength: 500,
		},
		images: [{
			type: String, // URLs of before/after photos
		}],
		wouldRecommend: {
			type: Boolean,
			default: true,
		},
		isAnonymous: {
			type: Boolean,
			default: false,
		},
		technicianResponse: {
			comment: { type: String, maxlength: 300 },
			respondedAt: { type: Date },
		},
		isVisible: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// Ensure one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;