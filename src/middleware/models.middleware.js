// Attaches models to req for cleaner controllers
import { User } from "../models/User.js";
import { Exercise } from "../models/Exercise.js";
import { Progress } from "../models/Progress.js";

export function attachModels(req, _res, next) {
  req.models = { User, Exercise, Progress };
  next();
}
