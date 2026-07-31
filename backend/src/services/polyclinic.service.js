import prisma from "../config/prisma.js";

export const getPolyclinicsService = async () => {
  return await prisma.polyclinic.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const getPolyclinicByIdService = async (id) => {
  return await prisma.polyclinic.findUnique({
    where: {
      id: Number(id),
    },
  });
};

export const createPolyclinicService = async (data) => {
  return await prisma.polyclinic.create({
    data: {
      name: data.name,
    },
  });
};

export const updatePolyclinicService = async (id, data) => {
  return await prisma.polyclinic.update({
    where: {
      id: Number(id),
    },
    data: {
      name: data.name,
    },
  });
};

export const deletePolyclinicService = async (id) => {
  return await prisma.polyclinic.delete({
    where: {
      id: Number(id),
    },
  });
};