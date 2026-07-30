import express from "express";

import {
  getRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
} from "../controllers/registration.controller.js";

const router = express.Router();

router.get("/", getRegistrations);
router.get("/:id", getRegistrationById);
router.post("/", createRegistration);
router.put("/:id", updateRegistration);
router.delete("/:id", deleteRegistration);

export default router;
