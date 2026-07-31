import {
  getPolyclinicsService,
  getPolyclinicByIdService,
  createPolyclinicService,
  updatePolyclinicService,
  deletePolyclinicService,
} from "../services/polyclinic.service.js";

export const getPolyclinics = async (req, res) => {
  const data = await getPolyclinicsService();

  res.json({
    success: true,
    data,
  });
};

export const getPolyclinicById = async (req, res) => {
  const data = await getPolyclinicByIdService(req.params.id);

  res.json({
    success: true,
    data,
  });
};

export const createPolyclinic = async (req, res) => {
  const data = await createPolyclinicService(req.body);

  res.json({
    success: true,
    message: "Poliklinik berhasil ditambahkan",
    data,
  });
};

export const updatePolyclinic = async (req, res) => {
  const data = await updatePolyclinicService(req.params.id, req.body);

  res.json({
    success: true,
    message: "Poliklinik berhasil diubah",
    data,
  });
};

export const deletePolyclinic = async (req, res) => {
  await deletePolyclinicService(req.params.id);

  res.json({
    success: true,
    message: "Poliklinik berhasil dihapus",
  });
};