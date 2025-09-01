import mongoose from "mongoose";
import User from "./user.model.js"; // Import the User model, since it now contains the technician role

const bidSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  technician: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    validate: {
      validator: async function(value) {
        const user = await User.findById(value);
        return user && user.role === "technician"; // Ensure the referenced user is a technician
      },
      message: "The user must be a technician."
    }
  },
  bidAmount: { type: Number, required: true },
  message: { type: String },
  estimatedDuration: { type: Number }, // in hours
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  acceptedAt: { type: Date }
}, { timestamps: true });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
