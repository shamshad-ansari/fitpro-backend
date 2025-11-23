export async function getMe(req, res) {
  return res.json({ success: true, data: req.user });
}

export async function updateProfile(req, res) {
  const { name, avatarUrl, heightCm, weightKg, fitnessLevel } = req.body;
  console.log(name, heightCm, weightKg, fitnessLevel);

  const updated = await req.models.User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, avatarUrl, heightCm, weightKg, fitnessLevel } },
    { new: true, runValidators: true, select: "-passwordHash" }
  );

  return res.json({ success: true, data: updated, message: "Profile updated" });
}

export async function setGoals(req, res) {
  const { goalType, targetWeightKg, weeklyWorkouts } = req.body;

  const updated = await req.models.User.findByIdAndUpdate(
    req.user._id,
    { $set: { goals: { goalType, targetWeightKg, weeklyWorkouts } } },
    { new: true, runValidators: true, select: "-passwordHash" }
  );

  return res.json({ success: true, data: updated, message: "Goals updated" });
}
