import express from "express";
import {
    createReview,
    getTechnicianReviews,
    respondToReview
} from "../controllers/review.controller.js";

const router = express.Router();

// Create review
router.post("/", createReview);

// Get reviews for technician
router.get("/technician/:technicianId", getTechnicianReviews);

// Technician respond to review
router.put("/:reviewId/respond", respondToReview);

export default router;
