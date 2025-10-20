import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";

import { env } from "./config/env.js";
import { attachModels } from "./middleware/models.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

// security headers
app.use(helmet());

// CORS — keep liberal in dev, restrict in prod
app.use(cors({ origin: env.corsOrigin, credentials: true }));

// JSON/URL parsing + payload limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(attachModels);

// basic hygiene
app.use(mongoSanitize()); // blocks $ and . in keys for Mongo injection
app.use(hpp()); // blocks HTTP param pollution
app.use(compression()); // gzip responses

// request logging (dev-friendly)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate-limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// Routes
app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);

// Errors (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
