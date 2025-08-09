// technician.model.js
import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        }],
        experience: {
            type: Number, // years of experience
            required: true,
        },
        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },
        hourlyRate: {
            type: Number,
            required: true,
        },
        availability: {
            monday: { start: String, end: String, available: Boolean },
            tuesday: { start: String, end: String, available: Boolean },
            wednesday: { start: String, end: String, available: Boolean },
            thursday: { start: String, end: String, available: Boolean },
            friday: { start: String, end: String, available: Boolean },
            saturday: { start: String, end: String, available: Boolean },
            sunday: { start: String, end: String, available: Boolean },
        },
        serviceArea: [{
            city: String,
            areas: [String],
        }],
        certifications: [{
            name: String,
            issuedBy: String,
            issuedDate: Date,
            expiryDate: Date,
        }],
        isVerified: {
            type: Boolean,
            default: false,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        totalJobs: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Technician = mongoose.model("Technician", technicianSchema);
export default Technician;