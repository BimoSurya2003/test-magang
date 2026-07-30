import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // =====================
  // ROLE
  // =====================

  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: {},
    create: {
      name: "Administrator",
    },
  });

  await prisma.role.upsert({
    where: { name: "Doctor" },
    update: {},
    create: {
      name: "Doctor",
    },
  });

  await prisma.role.upsert({
    where: { name: "Registration Officer" },
    update: {},
    create: {
      name: "Registration Officer",
    },
  });

  // =====================
  // USER ADMIN
  // =====================

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      username: "admin",
    },

    update: {},

    create: {
      username: "admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  // =====================
  // DATA DOKTER
  // =====================

  await prisma.doctor.createMany({
    data: [
      {
        name: "dr. Budi Santoso",
      },
      {
        name: "dr. Andi Wijaya",
      },
      {
        name: "dr. Siti Rahma",
      },
    ],

    skipDuplicates: true,
  });

  // =====================
  // DATA POLI
  // =====================

  await prisma.polyclinic.createMany({
    data: [
      {
        name: "Poli Umum",
      },
      {
        name: "Poli Gigi",
      },
      {
        name: "Poli Anak",
      },
    ],

    skipDuplicates: true,
  });

  console.log("Seeder berhasil dijalankan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
