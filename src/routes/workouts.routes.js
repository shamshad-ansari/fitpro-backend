// src/routes/workouts.routes.js
import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  createRoutine,
  listRoutines,
  getRoutineById,
  updateRoutine,
  createSession,
  listSessions,
} from "../controllers/workouts.controller.js";

const router = Router();

// All workout routes require authentication
router.use(authRequired);

// Sessions (history)
router.post("/sessions", createSession);
router.get("/sessions", listSessions);

// Routines
router.post("/", createRoutine);
router.get("/", listRoutines);
router.get("/:id", getRoutineById);
router.patch("/:id", updateRoutine);

export default router;
