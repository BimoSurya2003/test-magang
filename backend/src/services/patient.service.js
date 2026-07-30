import prisma from "../config/prisma.js";

export const getPatientsService = async (page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        nik: {
          contains: search,
        },
      },
    ],
  };

  const patients = await prisma.patient.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      id: "desc",
    },
  });

  const total = await prisma.patient.count({ where });

  return {
    data: patients,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

export const getPatientByIdService = async (id) => {
  return await prisma.patient.findUnique({
    where: {
      id: Number(id),
    },
  });
};

export const createPatientService = async (data) => {
  // Cek NIK
  const nikExist = await prisma.patient.findUnique({
    where: {
      nik: data.nik,
    },
  });

  if (nikExist) {
    throw new Error("NIK sudah digunakan");
  }

  // Generate Nomor Rekam Medis
  const lastPatient = await prisma.patient.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  let medicalRecord = "RM000001";

  if (lastPatient) {
    const lastNumber = Number(lastPatient.medicalRecord.substring(2));
    medicalRecord = `RM${String(lastNumber + 1).padStart(6, "0")}`;
  }

  return await prisma.patient.create({
    data: {
      medicalRecord,
      ...data,
      birthDate: new Date(data.birthDate),
    },
  });
};
