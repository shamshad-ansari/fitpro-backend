// src/models/Meal.js
import mongoose from "mongoose";

const MealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Date of the meal (we’ll query by day range)
    date: {
      type: Date,
      required: true,
    },

    // breakfast / lunch / dinner / snack / other
    type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "other"],
      default: "other",
    },

    // What you show in UI card header, e.g. "Breakfast"
    title: {
      type: String,
      required: true,
    },

    // Optional clock time (for UI details like "8:30 AM")
    time: {
      type: Date,
    },

    // Free text: "Oatmeal, Banana, Protein shake"
    description: {
      type: String,
    },

    // Aggregated macros for that meal
    calories: {
      type: Number,
      default: 0,
    },
    proteinG: {
      type: Number,
      default: 0,
    },
    carbsG: {
      type: Number,
      default: 0,
    },
    fatsG: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Meal = mongoose.model("Meal", MealSchema);
