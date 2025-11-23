// ========== SESSIONS (HISTORY) ==========

// POST /api/workouts/sessions
// Payload:
// {
//   routineId,
//   startedAt,
//   finishedAt,
//   exercises: [
//     {
//       name,
//       description,
//       bodyPart,
//       notes,
//       sets: [
//         { weightKg, reps, durationSec, calories, notes }
//       ]
//     }
//   ]
// }
export const createSession = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { routineId, startedAt, finishedAt, exercises } = req.body;

    if (!routineId || !startedAt || !finishedAt) {
      return res.status(400).json({
        success: false,
        message: "routineId, startedAt and finishedAt are required",
      });
    }

    const startDate = new Date(startedAt);
    const finishDate = new Date(finishedAt);

    const durationSec = Math.max(
      0,
      Math.round((finishDate.getTime() - startDate.getTime()) / 1000)
    );

    // Normalize exercise format
    const normalizedExercises = (exercises || []).map((ex) => {
      // New format: sets is an array
      if (Array.isArray(ex.sets)) {
        return {
          name: ex.name,
          description: ex.description,
          bodyPart: ex.bodyPart,
          notes: ex.notes,
          sets: ex.sets.map((s, idx) => ({
            index: idx + 1,
            weightKg: s.weightKg ?? null,
            reps: s.reps ?? null,
            durationSec: s.durationSec ?? null,
            calories: s.calories ?? null,
            notes: s.notes ?? null,
          })),
        };
      }

      // Old format: convert single set → one-set array
      return {
        name: ex.name,
        description: ex.description,
        bodyPart: ex.bodyPart,
        notes: ex.notes,
        sets: [
          {
            index: 1,
            weightKg: ex.weightKg ?? null,
            reps: ex.reps ?? null,
            durationSec:
              ex.durationMin != null ? Math.round(ex.durationMin * 60) : null,
            calories: ex.calories ?? null,
            notes: ex.notes ?? null,
          },
        ],
      };
    });

    // Create the workout session
    const session = await WorkoutSession.create({
      user: userId,
      workoutRoutine: routineId,
      startedAt: startDate,
      finishedAt: finishDate,
      durationSec,
      exercises: normalizedExercises,
    });

    await session.populate("workoutRoutine", "name");

    // Create flattened Exercise docs (for progress analytics)
    const flatDocs = [];

    normalizedExercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        flatDocs.push({
          user: userId,
          workoutRoutine: routineId,
          workoutSession: session._id,
          name: ex.name,
          category: ex.bodyPart || "strength",
          sets: 1,
          reps: set.reps,
          weightKg: set.weightKg,
          durationMin: set.durationSec ? set.durationSec / 60 : null,
          calories: set.calories,
          notes: set.notes,
          performedAt: finishDate,
        });
      });
    });

    if (flatDocs.length > 0) {
      await Exercise.insertMany(flatDocs);
    }

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
// optional query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
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
      .sort({ startedAt: -1 });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};