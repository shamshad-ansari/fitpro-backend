// Minimal route — create only
import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";

import { createExercise } from "../controllers/exercise.controller.js";

const router = Router();

// POST /api/exercises
router.post("/", authRequired, createExercise);

export default router;
