import { Router } from "express";
import { body } from "express-validator";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  getMe,
  updateProfile,
  setGoals,
} from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/me", authRequired, getMe);

router.put(
  "/me",
  authRequired,
  validate([
    body("name").optional().isString().isLength({ min: 2 }),
    body("avatarUrl").optional().isString(),
    body("heightCm").optional().isFloat({ min: 0 }),
    body("weightKg").optional().isFloat({ min: 0 }),
    body("fitnessLevel")
      .optional()
      .isIn(["beginner", "intermediate", "advanced"]),
  ]),
  updateProfile
);

router.put(
  "/me/goals",
  authRequired,
  validate([
    body("goalType")
      .optional()
      .isIn(["weight_loss", "muscle_gain", "maintenance"]),
    body("targetWeightKg").optional().isFloat({ min: 0 }),
    body("weeklyWorkouts").optional().isInt({ min: 0, max: 14 }),
  ]),
  setGoals
);

export default router;
