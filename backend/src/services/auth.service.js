import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginService = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("Username atau password salah");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Username atau password salah");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role.name,
    },
  };
};