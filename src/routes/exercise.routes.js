// src/routes/exercise.routes.js
import { Router } from "express";
import { body, query } from "express-validator";
import { authRequired } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createExercise,
  listExercises,
  summaryExercises,
  getLastExerciseForName, // ⬅️ import it
} from "../controllers/exercise.controller.js";

const router = Router();

// Create exercise
router.post(
  "/",
  authRequired,
  validate([
    body("name").isString().isLength({ min: 2 }),
    body("category").optional().isString(),
    body("durationMin").optional().isFloat({ min: 0 }),
    body("sets").optional().isInt({ min: 0 }),
    body("reps").optional().isInt({ min: 0 }),
    body("weightKg").optional().isFloat({ min: 0 }),
    body("distanceKm").optional().isFloat({ min: 0 }),
    body("calories").optional().isFloat({ min: 0 }),
    body("notes").optional().isString(),
    body("performedAt").optional().isISO8601(),
  ]),
  createExercise
);

// 🔹 NEW: last exercise for placeholder/ghost text
router.get(
  "/last",
  authRequired,
  validate([query("name").isString()]),
  getLastExerciseForName
);

// List exercises
router.get(
  "/",
  authRequired,
  validate([
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
    query("name").optional().isString(),
    query("category").optional().isString(),
  ]),
  listExercises
);

// Daily summary
router.get(
  "/summary",
  authRequired,
  validate([
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ]),
  summaryExercises
);

export default router;
