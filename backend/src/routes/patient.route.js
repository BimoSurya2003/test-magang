import express from "express";

import {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
} from "../controllers/patient.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getPatients);
router.get("/:id", verifyToken, getPatientById);
router.post("/", verifyToken, createPatient);
router.put("/:id", verifyToken, updatePatient);
router.delete("/:id", verifyToken, deletePatient);

export default router;