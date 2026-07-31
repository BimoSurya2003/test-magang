import express from "express";
import {
  getPolyclinics,
  getPolyclinicById,
  createPolyclinic,
  updatePolyclinic,
  deletePolyclinic,
} from "../controllers/polyclinic.controller.js";

const router = express.Router();

router.get("/", getPolyclinics);
router.get("/:id", getPolyclinicById);
router.post("/", createPolyclinic);
router.put("/:id", updatePolyclinic);
router.delete("/:id", deletePolyclinic);

export default router;