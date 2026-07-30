import express from "express";

import {
  getQueues,
  createQueue,
  callQueue,
  updateQueueStatus,
} from "../controllers/queue.controller.js";

const router = express.Router();

router.get("/", getQueues);
router.post("/", createQueue);
router.put("/:id/call", callQueue);
router.put("/:id/status", updateQueueStatus);

export default router;
