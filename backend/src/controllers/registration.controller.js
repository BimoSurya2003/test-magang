import {
  getRegistrationsService,
  getRegistrationByIdService,
  createRegistrationService,
  updateRegistrationService,
  deleteRegistrationService,
} from "../services/registration.service.js";

export const getRegistrations = async (req, res) => {
  const data = await getRegistrationsService();

  res.json({
    success: true,
    message: "Success",
    data,
  });
};

export const getRegistrationById = async (req, res) => {
  const data = await getRegistrationByIdService(req.params.id);

  res.json({
    success: true,
    message: "Success",
    data,
  });
};

export const createRegistration = async (req, res) => {
  const data = await createRegistrationService(req.body);

  res.json({
    success: true,
    message: "Pendaftaran berhasil",
    data,
  });
};

export const updateRegistration = async (req, res) => {
  const data = await updateRegistrationService(req.params.id, req.body);

  res.json({
    success: true,
    message: "Data berhasil diubah",
    data,
  });
};

export const deleteRegistration = async (req, res) => {
  await deleteRegistrationService(req.params.id);

  res.json({
    success: true,
    message: "Data berhasil dihapus",
  });
};
