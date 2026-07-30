import prisma from "../config/prisma.js";

// GET ALL QUEUE
export const getQueuesService = async () => {
  return await prisma.queue.findMany({
    include: {
      registration: {
        include: {
          patient: true,
          doctor: true,
          polyclinic: true,
        },
      },
    },

    orderBy: {
      id: "asc",
    },
  });
};

// CREATE QUEUE
export const createQueueService = async (data) => {
  const registration = await prisma.registration.findUnique({
    where: {
      id: Number(data.registrationId),
    },
  });

  if (!registration) {
    throw new Error("Pendaftaran tidak ditemukan");
  }

  const exist = await prisma.queue.findUnique({
    where: {
      registrationId: Number(data.registrationId),
    },
  });

  if (exist) {
    throw new Error("Antrean sudah dibuat");
  }

  const lastQueue = await prisma.queue.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  let queueNumber = "A001";

  if (lastQueue) {
    const lastNumber = Number(lastQueue.queueNumber.substring(1));

    queueNumber = `A${String(lastNumber + 1).padStart(3, "0")}`;
  }

  return await prisma.queue.create({
    data: {
      registrationId: Number(data.registrationId),
      queueNumber,
      status: "WAITING",
    },
  });
};

// CALL QUEUE
export const callQueueService = async (id) => {
  return await prisma.queue.update({
    where: {
      id: Number(id),
    },

    data: {
      status: "CHECK_IN",

      registration: {
        update: {
          status: "CHECK_IN",
        },
      },
    },
  });
};

// UPDATE STATUS
export const updateQueueStatusService = async (id, status) => {
  return await prisma.queue.update({
    where: {
      id: Number(id),
    },

    data: {
      status,

      registration: {
        update: {
          status,
        },
      },
    },
  });
};
