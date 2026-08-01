import prisma from "../config/prisma.js";

export const createMedicalRecordService = async (data) => {
  // cek pendaftaran
  const registration = await prisma.registration.findUnique({
    where: {
      id: Number(data.registrationId),
    },
  });

  if (!registration) {
    throw new Error("Pendaftaran tidak ditemukan");
  }

  if (registration.status !== "CHECK_IN") {
    throw new Error("Pasien belum dipanggil atau belum siap diperiksa.");
  }

  // cek apakah sudah pernah diperiksa
  const exist = await prisma.medicalRecord.findUnique({
    where: {
      registrationId: Number(data.registrationId),
    },
  });

  if (exist) {
    throw new Error("Rekam medis sudah ada");
  }

  const medicalRecord = await prisma.medicalRecord.create({
    data: {
      registrationId: Number(data.registrationId),
      patientId: registration.patientId,

      subjective: data.subjective,
      bloodPressure: data.bloodPressure,
      temperature: Number(data.temperature),
      weight: Number(data.weight),
      height: Number(data.height),
      assessment: data.assessment,
      plan: data.plan,

      actions: {
        create:
          data.actions?.map((item) => ({
            action: item.action,
          })) || [],
      },

      prescriptions: {
        create:
          data.prescriptions?.map((item) => ({
            medicine: item.medicine,
            dosage: item.dosage,
            instruction: item.instruction,
          })) || [],
      },
    },
    include: {
      actions: true,
      prescriptions: true,
    },
  });

  // update status kunjungan menjadi selesai
  await prisma.registration.update({
    where: {
      id: Number(data.registrationId),
    },
    data: {
      status: "FINISHED",
    },
  });

  await prisma.queue.update({
    where: {
      registrationId: Number(data.registrationId),
    },
    data: {
      status: "FINISHED",
    },
  });

  return medicalRecord;
};

export const getMedicalHistoryService = async (patientId) => {
  return await prisma.medicalRecord.findMany({
    where: {
      patientId: Number(patientId),
    },
    include: {
      registration: {
        include: {
          doctor: true,
          polyclinic: true,
        },
      },
      actions: true,
      prescriptions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
