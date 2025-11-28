// src/routes/workouts.routes.js
import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  createRoutine,
  listRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
  createSession,
  listSessions,
  deleteSession,
} from "../controllers/workouts.controller.js";

const router = Router();

// All workout routes require authentication
router.use(authRequired);

// Sessions (history)
router.post("/sessions", createSession);
router.get("/sessions", listSessions);
router.delete("/sessions/:id", deleteSession);

// Routines
router.post("/", createRoutine);
router.get("/", listRoutines);
router.get("/:id", getRoutineById);
router.patch("/:id", updateRoutine);
router.delete("/:id", deleteRoutine);

export default router;
