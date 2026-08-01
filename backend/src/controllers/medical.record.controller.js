import {
  createMedicalRecordService,
  getMedicalHistoryService,
} from "../services/medical.record.service.js";

export const createMedicalRecord = async (req, res) => {
  try {
    const result = await createMedicalRecordService(req.body);

    res.status(201).json({
      success: true,
      message: "Rekam medis berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMedicalHistory = async (req, res) => {
  try {
    const result = await getMedicalHistoryService(req.params.patientId);

    res.json({
      success: true,
      message: "Success",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};