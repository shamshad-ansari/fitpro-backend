import { Progress } from "../models/Progress.js";

// normalize a date to midnight UTC (simple server-side standardization)
function atMidnightUTC(d = new Date()) {
  const dt = new Date(d);
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
  );
}

// Upsert a daily log
export async function upsertProgress(req, res) {
  const { date, metrics, badges } = req.body;
  const day = date ? atMidnightUTC(new Date(date)) : atMidnightUTC();

  const doc = await Progress.findOneAndUpdate(
    { user: req.user._id, date: day },
    {
      $set: {
        ...(metrics && { metrics }),
      },
      ...(badges && badges.length
        ? { $addToSet: { badges: { $each: badges } } }
        : {}),
    },
    { new: true, upsert: true }
  );

  return res
    .status(201)
    .json({ success: true, data: doc, message: "Progress saved" });
}

// List progress in a range
export async function listProgress(req, res) {
  const { from, to } = req.query;
  const q = { user: req.user._id };
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = atMidnightUTC(new Date(from));
    if (to) q.date.$lte = atMidnightUTC(new Date(to));
  }
  const items = await Progress.find(q).sort({ date: 1 });
  return res.json({ success: true, data: items });
}

// Compute current streak (consecutive days with any progress entry)
export async function currentStreak(req, res) {
  // pull last 60 days as a simple bound (tune as needed)
  const today = atMidnightUTC(new Date());
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 60);

  const rows = await Progress.find({
    user: req.user._id,
    date: { $gte: start, $lte: today },
  })
    .sort({ date: -1 })
    .select("date");

  // walk days backwards from today counting consecutive matches
  const set = new Set(rows.map((r) => r.date.toISOString()));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    if (set.has(d.toISOString())) streak++;
    else break;
  }

  return res.json({ success: true, data: { streakDays: streak } });
}
