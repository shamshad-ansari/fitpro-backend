import { WorkoutRoutine } from "../models/WorkoutRoutine.js";
import { WorkoutSession } from "../models/WorkoutSession.js";
import { Exercise } from "../models/Exercise.js";

// Helper to get userId from req.user set by auth middleware
const getUserId = (req) => req.user?.id || req.user?._id;


// POST /api/workouts
export const createRoutine = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { name, notes, exercises } = req.body;

    const routine = await WorkoutRoutine.create({
      user: userId,
      name,
      notes,
      exercises: exercises || [],
    });

    res.status(201).json({
      success: true,
      data: routine,
      message: "Routine created",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts
export const listRoutines = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const routines = await WorkoutRoutine.find({
      user: userId,
      isArchived: false,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: routines,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts/:id
export const getRoutineById = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const routine = await WorkoutRoutine.findOne({
      _id: id,
      user: userId,
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    res.json({
      success: true,
      data: routine,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/workouts/:id
export const updateRoutine = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { name, notes, exercises, isArchived } = req.body;

    const routine = await WorkoutRoutine.findOneAndUpdate(
      { _id: id, user: userId },
      {
        ...(name !== undefined ? { name } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(exercises !== undefined ? { exercises } : {}),
        ...(isArchived !== undefined ? { isArchived } : {}),
      },
      { new: true }
    );

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    res.json({
      success: true,
      data: routine,
      message: "Routine updated",
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workouts/:id 
export const deleteRoutine = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const routine = await WorkoutRoutine.findOneAndUpdate(
      { _id: id, user: userId },
      { isArchived: true },
      { new: true }
    );

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    return res.json({
      success: true,
      data: routine,
      message: "Routine archived",
    });
  } catch (err) {
    next(err);
  }
};


// ========== SESSIONS (HISTORY) ==========

// POST /api/workouts/sessions
export const createSession = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { routineId, startedAt, finishedAt, exercises = [] } = req.body;

    // TEMP: debug log
    console.log("Incoming session body:", JSON.stringify(req.body, null, 2));

    if (!routineId || !startedAt || !finishedAt) {
      return res.status(400).json({
        success: false,
        message: "routineId, startedAt, finishedAt are required",
      });
    }

    const start = new Date(startedAt);
    const end = new Date(finishedAt);

    const durationSec = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / 1000)
    );

    // Normalize multi-set exercises
    const normalizedExercises = (exercises || []).map((ex) => {
      const sets = Array.isArray(ex.sets)
        ? ex.sets.map((s, i) => ({
            index: s.index ?? i + 1,
            weightKg: s.weightKg ?? null,
            reps: s.reps ?? null,
            durationSec: s.durationSec ?? null,
            calories: s.calories ?? null,
            notes: s.notes ?? null,
          }))
        : [
            {
              index: 1,
              weightKg: ex.weightKg ?? null,
              reps: ex.reps ?? null,
              durationSec:
                ex.durationMin != null ? Math.round(ex.durationMin * 60) : null,
              calories: ex.calories ?? null,
              notes: ex.notes ?? null,
            },
          ];

      return {
        name: ex.name,
        description: ex.description,
        bodyPart: ex.bodyPart,
        notes: ex.notes,
        sets,
      };
    });

    console.log(
      "Normalized exercises:",
      JSON.stringify(normalizedExercises, null, 2)
    );

    const session = await WorkoutSession.create({
      user: userId,
      workoutRoutine: routineId,
      startedAt: start,
      finishedAt: end,
      durationSec,
      exercises: normalizedExercises, // Critical to use normalized exercises
    });

    await session.populate("workoutRoutine", "name");

    res.status(201).json({
      success: true,
      data: session,
      message: "Workout session saved",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts/sessions
export const listSessions = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { from, to } = req.query;

    const filter = { user: userId };

    if (from || to) {
      filter.startedAt = {};
      if (from) filter.startedAt.$gte = new Date(from);
      if (to) filter.startedAt.$lte = new Date(to);
    }

    const sessions = await WorkoutSession.find(filter)
      .populate("workoutRoutine", "name")
      .sort({ startedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workouts/sessions/:id
export const deleteSession = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const session = await WorkoutSession.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.json({
      success: true,
      data: session,
      message: "Workout session deleted",
    });
  } catch (err) {
    next(err);
  }
};