// JWT helpers
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";


export function signAccessToken(userId, email) {
  return jwt.sign({ sub: userId, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
