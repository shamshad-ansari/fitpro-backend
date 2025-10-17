// Verify JWT and attach req.user
import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Missing or invalid token" });

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
}
