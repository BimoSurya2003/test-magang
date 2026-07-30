import {
  getQueuesService,
  createQueueService,
  callQueueService,
  updateQueueStatusService,
} from "../services/queue.service.js";

// GET QUEUE

export const getQueues = async (req, res) => {
  try {
    const data = await getQueuesService();

    res.json({
      success: true,
      message: "Success",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE QUEUE

export const createQueue = async (req, res) => {
  try {
    const data = await createQueueService(req.body);

    res.json({
      success: true,
      message: "Antrean berhasil dibuat",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// CALL QUEUE

export const callQueue = async (req, res) => {
  try {
    const data = await callQueueService(req.params.id);

    res.json({
      success: true,
      message: "Antrean dipanggil",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STATUS

export const updateQueueStatus = async (req, res) => {
  try {
    const data = await updateQueueStatusService(req.params.id, req.body.status);

    res.json({
      success: true,
      message: "Status berhasil diperbarui",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
