// protected /me
import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { getMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authRequired, getMe);

export default router;
