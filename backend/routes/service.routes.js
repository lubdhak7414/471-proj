import express from "express";
import {
    createService,
    getAllServices,
    getServiceById,
    getServiceCategories,
    updateService
} from "../controllers/service.controller.js";

const router = express.Router();

// Create a new service
router.post("/", createService);

// Get all services (with filters & pagination)
router.get("/", getAllServices);

// Get service categories
router.get("/categories", getServiceCategories);

// Get service by ID
router.get("/:id", getServiceById);

// Update service
router.put("/:id", updateService);

export default router;
