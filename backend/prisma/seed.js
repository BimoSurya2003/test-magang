import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Role
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

  // Hash Password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Admin User
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