import prisma from "../config/prisma.js";

export const getDoctorsService = async () => {
  return await prisma.doctor.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const getDoctorByIdService = async (id) => {
  return await prisma.doctor.findUnique({
    where: {
      id: Number(id),
    },
  });
};

export const createDoctorService = async (data) => {
  return await prisma.doctor.create({
    data: {
      name: data.name,
    },
  });
};

export const updateDoctorService = async (id, data) => {
  return await prisma.doctor.update({
    where: {
      id: Number(id),
    },
    data: {
      name: data.name,
    },
  });
};

export const deleteDoctorService = async (id) => {
  return await prisma.doctor.delete({
    where: {
      id: Number(id),
    },
  });
};