import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true }, // e.g., "Bench Press"
    category: { type: String, trim: true }, // e.g., "strength", "cardio"
    durationMin: { type: Number, min: 0 },
    performedAt: { type: Date, default: Date.now, index: true },
    // room to grow later: sets, reps, weightKg, distanceKm, calories, notes...
  },
  { timestamps: true }
);

export const Exercise = mongoose.model("Exercise", ExerciseSchema);
