import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(express.json());

// Basic parsing; will add security middleware later
app.use(express.json());

app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export default app;
