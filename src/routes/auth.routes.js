import { Router } from "express";
import { body } from "express-validator";
import { signup } from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("name")
      .isString()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 chars"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),
  ],
  signup
);

export default router;
