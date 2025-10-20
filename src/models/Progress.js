import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true }, // store at midnight UTC or normalized
    metrics: {
      weightKg: { type: Number, min: 0 },
      bodyFatPct: { type: Number, min: 0, max: 100 },
      steps: { type: Number, min: 0 },
      caloriesBurned: { type: Number, min: 0 },
    },
    streakCount: { type: Number, default: 0 }, // optional, can be computed on read
    badges: [{ type: String }],
  },
  { timestamps: true }
);

// prevent duplicate logs per day/user
ProgressSchema.index({ user: 1, date: 1 }, { unique: true });

export const Progress = mongoose.model("Progress", ProgressSchema);
