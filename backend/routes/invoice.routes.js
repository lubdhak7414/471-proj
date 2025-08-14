import express from "express";
import {
    createInvoice,
    getInvoiceById,
    getUserInvoices,
    generateInvoicePDF
} from "../controllers/invoice.controller.js";

const router = express.Router();

// Create invoice for a booking
router.post("/booking/:bookingId", createInvoice);

// Get invoice by ID
router.get("/:id", getInvoiceById);

// Get invoices by user
router.get("/user/:userId", getUserInvoices);

// Generate invoice PDF
router.get("/:invoiceId/pdf", generateInvoicePDF);

export default router;
