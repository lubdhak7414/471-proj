import mongoose from "mongoose";
const bidSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "Technician", required: true },
    bidAmount: { type: Number, required: true },
    message: { type: String },
    estimatedDuration: { type: Number }, // in hours
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    acceptedAt: { type: Date }
}, { timestamps: true });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;