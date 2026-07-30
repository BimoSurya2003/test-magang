import {
  getPatientsService,
  getPatientByIdService,
  createPatientService,
} from "../services/patient.service.js";

export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const patients = await getPatientsService(page, limit, search);

    res.json({
      success: true,
      message: "Success",
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await getPatientByIdService(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPatient = async (req, res) => {
  try {
    const patient = await createPatientService(req.body);

    res.status(201).json({
      success: true,
      message: "Patient berhasil ditambahkan",
      data: patient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
