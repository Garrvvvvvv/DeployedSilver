// routes/adminEvent.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  getAllRegistrations,
  updateRegistrationStatus,
} from "../controllers/eventController.js";

const router = Router();

/**
 * Admin guard:
 * - Authorization: Bearer <token>
 * - Verifies with ADMIN_JWT_SECRET (falls back to JWT_SECRET)
 * - Attaches decoded payload to req.admin
 */
function requireAdmin(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Admin token missing" });

    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "Server misconfigured (no admin JWT secret)" });
    }

    const payload = jwt.verify(token, secret);
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid admin token" });
  }
}

/**
 * GET /api/admin/event/registrations?status=PENDING|APPROVED|REJECTED
 */
router.get("/registrations", requireAdmin, getAllRegistrations);

/**
 * PUT /api/admin/event/registrations/:id/status
 * Body: { status: "APPROVED" | "REJECTED" | "PENDING" }
 */
router.put("/registrations/:id/status", requireAdmin, updateRegistrationStatus);

export default router;
