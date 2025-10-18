// Minimal controller — create only
import { Exercise } from "../models/Exercise.js";

export async function createExercise(req, res) {
  // req.user is set by authRequired
  const { name, category, durationMin, performedAt } = req.body;

  const exercise = await Exercise.create({
    user: req.user._id,
    name,
    category,
    durationMin,
    performedAt: performedAt ? new Date(performedAt) : undefined,
  });

  return res
    .status(201)
    .json({ success: true, data: exercise, message: "Exercise logged" });
}
