import express from "express";

import {
    getPatients,
    getPatientById,
    createPatient
} from "../controllers/patient.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getPatients);
router.get("/:id", verifyToken, getPatientById);
router.post("/", verifyToken, createPatient);

export default router;