import { loginService } from "../services/auth.service.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const data = await loginService(username, password);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logout berhasil"
    });
};