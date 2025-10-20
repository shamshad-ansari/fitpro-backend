import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true }, // "strength", "cardio", etc.
    durationMin: { type: Number, min: 0 },
    sets: { type: Number, min: 0 },
    reps: { type: Number, min: 0 },
    weightKg: { type: Number, min: 0 },
    distanceKm: { type: Number, min: 0 },
    calories: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    performedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const Exercise = mongoose.model("Exercise", ExerciseSchema);
