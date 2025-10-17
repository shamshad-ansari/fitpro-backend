import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();

// Basic parsing; will add security middleware later
app.use(express.json());

app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);

export default app;
