import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Mini Clinic Information System API"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});