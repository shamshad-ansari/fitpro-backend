// src/controllers/nutrition.controller.js
import mongoose from "mongoose";
import { Meal } from "../models/Meal.js";
import { User } from "../models/User.js";

// Helper: Extract User ID safely
const getUserId = (req) => req.user?.id || req.user?._id;

// Helper: Ensure we always save a valid number (prevents NaN)
const parseNum = (val) => {
  if (val === undefined || val === null) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

// Helper: strict UTC day bounds
// This ensures that if we ask for "2025-11-28", we get everything from
// 00:00:00 UTC to 23:59:59 UTC on that specific day.
function dayBounds(date) {
  const d = new Date(date);

  const start = new Date(d);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

// POST /api/nutrition/meals
export async function createMeal(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      date,
      type,
      title,
      time,
      description,
      calories,
      proteinG,
      carbsG,
      fatsG,
    } = req.body;

    // 1. Handle Date
    // new Date("YYYY-MM-DD") automatically defaults to UTC 00:00:00
    const mealDate = date ? new Date(date) : new Date();

    // 2. Handle Title / Type defaults
    const mealType = type || "other";
    const mealTitle =
      title && title.trim().length > 0
        ? title.trim()
        : mealType.charAt(0).toUpperCase() + mealType.slice(1);

    // 3. Build Data Object
    const mealData = {
      user: userId,
      date: mealDate,
      type: mealType,
      title: mealTitle,
      description: description || "",
      calories: parseNum(calories),
      proteinG: parseNum(proteinG),
      carbsG: parseNum(carbsG),
      fatsG: parseNum(fatsG),
    };

    // 4. Handle Time (Optional)
    if (time) {
      mealData.time = new Date(time);
    }

    const meal = await Meal.create(mealData);

    return res.status(201).json({
      success: true,
      data: meal,
      message: "Meal logged successfully",
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/nutrition/meals?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function listMeals(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { from, to } = req.query;
    const filter = { user: userId };

    if (from || to) {
      filter.date = {};
      if (from) {
        const { start } = dayBounds(from);
        filter.date.$gte = start;
      }
      if (to) {
        const { end } = dayBounds(to);
        filter.date.$lte = end;
      }
    }

    const meals = await Meal.find(filter).sort({ date: -1, time: -1 });

    return res.json({
      success: true,
      data: meals,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/nutrition/meals/:id
export async function updateMeal(req, res, next) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const {
      date,
      type,
      title,
      time,
      description,
      calories,
      proteinG,
      carbsG,
      fatsG,
    } = req.body;

    const updates = {};

    if (date !== undefined) updates.date = new Date(date);
    if (type !== undefined) updates.type = type;
    if (title !== undefined) updates.title = title;
    if (time !== undefined) updates.time = time ? new Date(time) : null;
    if (description !== undefined) updates.description = description;

    if (calories !== undefined) updates.calories = parseNum(calories);
    if (proteinG !== undefined) updates.proteinG = parseNum(proteinG);
    if (carbsG !== undefined) updates.carbsG = parseNum(carbsG);
    if (fatsG !== undefined) updates.fatsG = parseNum(fatsG);

    const meal = await Meal.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }

    return res.json({
      success: true,
      data: meal,
      message: "Meal updated",
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/nutrition/meals/:id
export async function deleteMeal(req, res, next) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const deleted = await Meal.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }

    return res.json({
      success: true,
      message: "Meal deleted",
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/nutrition/summary?date=YYYY-MM-DD
export async function getDailySummary(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { date } = req.query;

    // If date is provided, use it. Otherwise use 'now'.
    // NOTE: 'date' query param should be YYYY-MM-DD
    const targetDate = date ? new Date(date) : new Date();

    // Calculate strict UTC bounds
    const { start, end } = dayBounds(targetDate);

    // Convert to ObjectId for Aggregation
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Aggregate Meals
    const mealAgg = await Meal.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          calories: { $sum: "$calories" },
          proteinG: { $sum: "$proteinG" },
          carbsG: { $sum: "$carbsG" },
          fatsG: { $sum: "$fatsG" },
        },
      },
    ]);

    const mealsTotals = mealAgg[0] || {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatsG: 0,
    };

    // 2. Get User Goals
    const user = await User.findById(userId).lean();

    const calorieGoal = user?.dailyCalorieTarget ?? 2000;
    const macroTargets = user?.macroTargets || {};
    const proteinTarget = macroTargets.proteinG ?? 150;
    const carbsTarget = macroTargets.carbsG ?? 250;
    const fatsTarget = macroTargets.fatsG ?? 65;

    // 3. Calculate Final Numbers
    const caloriesEaten = Math.round(mealsTotals.calories);
    const burned = 0; // Hardcoded as requested
    const remaining = calorieGoal - caloriesEaten;

    return res.json({
      success: true,
      data: {
        date: targetDate.toISOString().slice(0, 10),
        calories: {
          eaten: caloriesEaten,
          burned: burned,
          goal: calorieGoal,
          remaining: remaining,
        },
        macros: {
          protein: {
            grams: Math.round(mealsTotals.proteinG),
            target: proteinTarget,
          },
          carbs: {
            grams: Math.round(mealsTotals.carbsG),
            target: carbsTarget,
          },
          fats: {
            grams: Math.round(mealsTotals.fatsG),
            target: fatsTarget,
          },
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
