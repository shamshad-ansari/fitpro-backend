import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();

// Basic parsing; will add security middleware later
app.use(express.json());

app.use("/", healthRoutes);

export default app;
