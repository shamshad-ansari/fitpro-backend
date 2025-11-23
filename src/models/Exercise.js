// src/models/Exercise.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Link back to the routine template (optional)
    workoutRoutine: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutRoutine",
      index: true,
    },
    // Link back to the concrete session (optional)
    workoutSession: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutSession",
      index: true,
    },

    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["strength", "cardio", "mobility", "other"],
      default: "strength",
    },

    // Aggregated stats for this exercise instance
    sets: { type: Number, min: 0 },
    reps: { type: Number, min: 0 },
    weightKg: { type: Number, min: 0 },
    durationMin: { type: Number, min: 0 },
    calories: { type: Number, min: 0 },

    notes: { type: String, trim: true },

    performedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Exercise = mongoose.model("Exercise", exerciseSchema);
