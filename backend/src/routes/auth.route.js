import express from "express";
import { login, logout } from "../controllers/auth.controller.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", verifyToken, logout);

// router.get(
//     "/profile",
//     verifyToken,
//     (req, res) => {

//         res.json({
//             success: true,
//             data: req.user
//         });

//     }
// );

// router.get(
//     "/admin",
//     verifyToken,
//     authorizeRole("Administrator"),
//     (req, res) => {
//         res.json({
//             success: true,
//             message: "Selamat datang Admin"
//         });
//     }
// );

export default router;