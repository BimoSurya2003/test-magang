import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoute from "./src/routes/auth.route.js";
import patientRoute from "./src/routes/patient.route.js";
import registrationRoute from "./src/routes/registration.route.js";
import queueRoute from "./src/routes/queue.route.js";
import doctorRoute from "./src/routes/doctor.route.js";
import polyclinicRoute from "./src/routes/polyclinic.route.js";


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Default Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mini Clinic Information System API",
  });
});

// Route
app.use("/api/auth", authRoute);
app.use("/api/patients", patientRoute);
app.use("/api/registrations", registrationRoute);
app.use("/api/queues", queueRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/polyclinics", polyclinicRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
