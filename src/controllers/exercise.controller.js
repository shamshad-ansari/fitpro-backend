import { Exercise } from "../models/Exercise.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export async function createExercise(req, res) {
  const {
    name,
    category,
    durationMin,
    sets,
    reps,
    weightKg,
    distanceKm,
    calories,
    notes,
    performedAt,
  } = req.body;

  const exercise = await Exercise.create({
    user: req.user._id,
    name,
    category,
    durationMin,
    sets,
    reps,
    weightKg,
    distanceKm,
    calories,
    notes,
    performedAt: performedAt ? new Date(performedAt) : undefined,
  });

  return res
    .status(201)
    .json({ success: true, data: exercise, message: "Exercise logged" });
}

export async function listExercises(req, res) {
  const { page = 1, limit = 20, from, to, name, category } = req.query;
  const q = { user: req.user._id };
  if (from || to) {
    q.performedAt = {};
    if (from) q.performedAt.$gte = new Date(from);
    if (to) q.performedAt.$lte = new Date(to);
  }
  if (name) q.name = new RegExp(name, "i");
  if (category) q.category = category;

  const pageNum = Math.max(1, parseInt(page, 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * pageSize;

  const [items, total] = await Promise.all([
    Exercise.find(q).sort({ performedAt: -1 }).skip(skip).limit(pageSize),
    Exercise.countDocuments(q),
  ]);

  return res.json({
    success: true,
    data: { items, total, page: pageNum, pages: Math.ceil(total / pageSize) },
  });
}

// Daily summary (sessions, minutes, calories) within date range
export async function summaryExercises(req, res) {
  const { from, to } = req.query;
  const match = { user: req.user._id };
  if (from || to) {
    match.performedAt = {};
    if (from) match.performedAt.$gte = new Date(from);
    if (to) match.performedAt.$lte = new Date(to);
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: {
          y: { $year: "$performedAt" },
          m: { $month: "$performedAt" },
          d: { $dayOfMonth: "$performedAt" },
        },
        sessions: { $sum: 1 },
        minutes: { $sum: { $ifNull: ["$durationMin", 0] } },
        calories: { $sum: { $ifNull: ["$calories", 0] } },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: { year: "$_id.y", month: "$_id.m", day: "$_id.d" },
        },
        sessions: 1,
        minutes: 1,
        calories: 1,
      },
    },
  ];

  const rows = await Exercise.aggregate(pipeline);
  return res.json({ success: true, data: rows });
}

// GET /api/exercises/last?name=ExerciseName
export async function getLastExerciseForName(req, res, next) {
  try {
    const userId = req.user._id;
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Missing 'name' query parameter",
      });
    }

    const last = await Exercise.findOne({ user: userId, name })
      .sort({ performedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: last || null,  // null = no history = empty placeholders on iOS
    });
  } catch (err) {
    next(err);
  }
}