import {
  getDoctorsService,
  getDoctorByIdService,
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
} from "../services/doctor.service.js";

export const getDoctors = async (req, res) => {
  const data = await getDoctorsService();

  res.json({
    success: true,
    data,
  });
};

export const getDoctorById = async (req, res) => {
  const data = await getDoctorByIdService(req.params.id);

  res.json({
    success: true,
    data,
  });
};

export const createDoctor = async (req, res) => {
  const data = await createDoctorService(req.body);

  res.json({
    success: true,
    message: "Dokter berhasil ditambahkan",
    data,
  });
};

export const updateDoctor = async (req, res) => {
  const data = await updateDoctorService(req.params.id, req.body);

  res.json({
    success: true,
    message: "Dokter berhasil diubah",
    data,
  });
};

export const deleteDoctor = async (req, res) => {
  await deleteDoctorService(req.params.id);

  res.json({
    success: true,
    message: "Dokter berhasil dihapus",
  });
};