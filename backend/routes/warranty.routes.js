import express from "express";
import {
    createWarranty,
    getWarrantyById,
    getUserWarranties,
    createWarrantyClaim,
    generateWarrantyPDF
} from "../controllers/warranty.controller.js";

const router = express.Router();

// Create warranty for a booking
router.post("/booking/:bookingId", createWarranty);

// Get warranty by ID
router.get("/:id", getWarrantyById);

// Get warranties by user
router.get("/user/:userId", getUserWarranties);

// Create warranty claim
router.post("/:warrantyId/claims", createWarrantyClaim);

// Generate warranty PDF
router.get("/:warrantyId/pdf", generateWarrantyPDF);

export default router;
