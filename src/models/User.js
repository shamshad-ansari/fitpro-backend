import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    goalType: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "maintenance"],
      default: "maintenance",
    },
    targetWeightKg: { type: Number, min: 0 },
    weeklyWorkouts: { type: Number, min: 0 },
  },
  { _id: false } // embedded subdocument, no separate _id
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true, // index for uniqueness
      index: true, // fast lookup
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    age: { type: Number, required: true, trim: true },
    heightCm: { type: Number, min: 0 },
    weightKg: { type: Number, min: 0 },
    gender: {
      type: String,
      enum: ["male", "female", "non_binary", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    dailyCalorieTarget: {
      type: Number,
      default: 2000, // can tweak later or calculate from profile
    },

    macroTargets: {
      proteinG: { type: Number, default: 150 },
      carbsG: { type: Number, default: 250 },
      fatsG: { type: Number, default: 65 },
    },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    goals: GoalSchema, // embedded goals for quick access
  },
  { timestamps: true } // createdAt, updatedAt
);

// Optional: compound indexes later if needed (e.g., { email: 1 })

export const User = mongoose.model("User", userSchema);
