import { Router } from "express";
import { body, query } from "express-validator";
import { authRequired } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  upsertProgress,
  listProgress,
  currentStreak,
} from "../controllers/progress.controller.js";

const router = Router();

// POST /api/progress  (upsert by (user,date))
router.post(
  "/",
  authRequired,
  validate([
    body("date").optional().isISO8601(),
    body("metrics").optional().isObject(),
    body("metrics.weightKg").optional().isFloat({ min: 0 }),
    body("metrics.bodyFatPct").optional().isFloat({ min: 0, max: 100 }),
    body("metrics.steps").optional().isInt({ min: 0 }),
    body("metrics.caloriesBurned").optional().isFloat({ min: 0 }),
    body("badges").optional().isArray(),
  ]),
  upsertProgress
);

// GET /api/progress?from&to
router.get(
  "/",
  authRequired,
  validate([
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ]),
  listProgress
);

// GET /api/progress/streak
router.get("/streak", authRequired, currentStreak);

export default router;
