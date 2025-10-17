// Minimal signup

import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { User } from "../models/Users";
import { signAccessToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
  }

  const { email, name, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, name, passwordHash });

  const safeUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    fitnessLevel: user.fitnessLevel,
    goals: user.goals,
  };

  return res
    .status(201)
    .json({
      success: true,
      data: { user: safeUser },
      message: "Signup successful",
    });
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });

  const token = signAccessToken(user._id);

  const safeUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    fitnessLevel: user.fitnessLevel,
    goals: user.goals,
  };

  return res.json({
    success: true,
    data: { user: safeUser, token },
    message: "Login successful",
  });
}