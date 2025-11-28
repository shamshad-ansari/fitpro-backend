// src/models/WorkoutRoutine.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const routineExerciseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    bodyPart: { type: String },

    defaultSets: { type: Number, min: 1, default: 3 },
    defaultReps: { type: Number, min: 1, default: 10 },
    defaultWeightKg: { type: Number, min: 0 },

    order: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const workoutRoutineSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },

    exercises: [routineExerciseSchema],

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const WorkoutRoutine = mongoose.model(
  "WorkoutRoutine",
  workoutRoutineSchema
);
