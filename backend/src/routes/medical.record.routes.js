import express from "express";
import {
  createMedicalRecord,
  getMedicalHistory,
} from "../controllers/medical.record.controller.js";

const router = express.Router();

router.post("/", createMedicalRecord);
router.get("/:patientId", getMedicalHistory);

export default router;