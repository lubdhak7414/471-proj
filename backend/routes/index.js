import express from "express";
import userRoutes from "./user.routes.js";
import bookingRoutes from "./booking.routes.js";
import serviceRoutes from "./service.routes.js";
import technicianRoutes from "./technician.routes.js";
import paymentRoutes from "./payment.routes.js";
import reviewRoutes from "./review.routes.js";
import invoiceRoutes from "./invoice.routes.js";
import warrantyRoutes from "./warranty.routes.js";
import chatRoutes from "./chat.routes.js";
import bidRoutes from "./bid.routes.js";

const router = express.Router();

// Attach each route group
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);
router.use("/services", serviceRoutes);
router.use("/technicians", technicianRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/warranties", warrantyRoutes);
router.use("/chat", chatRoutes);
router.use("/bids", bidRoutes);

export default router;
