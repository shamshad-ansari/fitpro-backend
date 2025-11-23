import mongoose from "mongoose";

const { Schema, model } = mongoose;
const ObjectId = Schema.Types.ObjectId;

// One *set* within an exercise in a session
const WorkoutSetSchema = new Schema(
  {
    index: { type: Number }, // 1, 2, 3… (optional but nice to have)
    weightKg: { type: Number }, // can vary per set
    reps: { type: Number },
    durationSec: { type: Number }, // if you ever time a set / interval
    calories: { type: Number },
    notes: { type: String }, // per-set notes if you want later
  },
  { _id: false }
);

// One *exercise* performed in a session
const WorkoutSessionExerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    bodyPart: { type: String },

    // NEW: array of sets (each with its own reps/weight/etc.)
    sets: {
      type: [WorkoutSetSchema],
      default: [],
    },

    // Optional high-level notes for this exercise
    notes: { type: String },
  },
  { _id: false }
);

const WorkoutSessionSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    workoutRoutine: {
      type: ObjectId,
      ref: "WorkoutRoutine",
      required: true,
    },

    startedAt: { type: Date, required: true },
    finishedAt: { type: Date },
    durationSec: { type: Number },

    // Detailed per-exercise, per-set info
    exercises: {
      type: [WorkoutSessionExerciseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const WorkoutSession = model("WorkoutSession", WorkoutSessionSchema);
