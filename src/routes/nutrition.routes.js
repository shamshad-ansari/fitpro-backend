// src/routes/nutrition.routes.js
import { Router } from "express";
import { body, query } from "express-validator";
import { authRequired } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createMeal,
  listMeals,
  updateMeal,
  deleteMeal,
  getDailySummary,
} from "../controllers/nutrition.controller.js";

const router = Router();

// All nutrition routes require authentication
router.use(authRequired);

router.post("/meals/test", (req, res) => {
  res.json({
    body: req.body,
    headers: req.headers,
    contentType: req.get("content-type"),
  });
});


// POST /api/nutrition/meals
router.post(
  "/meals",
  validate([
    body("title").optional().isString().isLength({ min: 1 }),
    body("date").optional().isISO8601(),
    body("time").optional().isISO8601(),
    body("type")
      .optional()
      .isIn(["breakfast", "lunch", "dinner", "snack", "other"]),
    body("calories").optional().isFloat({ min: 0 }),
    body("proteinG").optional().isFloat({ min: 0 }),
    body("carbsG").optional().isFloat({ min: 0 }),
    body("fatsG").optional().isFloat({ min: 0 }),
  ]),
  createMeal
);

// GET /api/nutrition/meals
router.get(
  "/meals",
  validate([
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ]),
  listMeals
);

// PATCH /api/nutrition/meals/:id
router.patch(
  "/meals/:id",
  validate([
    body("date").optional().isISO8601(),
    body("time").optional().isISO8601(),
    body("type")
      .optional()
      .isIn(["breakfast", "lunch", "dinner", "snack", "other"]),
    body("calories").optional().isFloat({ min: 0 }),
    body("proteinG").optional().isFloat({ min: 0 }),
    body("carbsG").optional().isFloat({ min: 0 }),
    body("fatsG").optional().isFloat({ min: 0 }),
  ]),
  updateMeal
);

// DELETE /api/nutrition/meals/:id
router.delete("/meals/:id", deleteMeal);

// GET /api/nutrition/summary?date=YYYY-MM-DD
router.get(
  "/summary",
  validate([query("date").optional().isISO8601()]),
  getDailySummary
);


export default router;
