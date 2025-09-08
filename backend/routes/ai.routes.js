import express from "express";
import { getDiagnosis } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/", getDiagnosis);

export default router;