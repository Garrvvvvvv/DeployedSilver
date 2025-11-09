// middleware/adminAuth.js
import jwt from "jsonwebtoken";

/**
 * Protect admin routes.
 * Expects header: Authorization: Bearer <token>
 * or cookie: adminToken (fallback)
 * Verifies with ADMIN_JWT_SECRET and algorithm HS256.
 * Also enforces payload.role === 'admin' (or payload.isAdmin)
 */
export default function requireAdmin(req, res, next) {
  try {
    const rawAuth = (req.headers.authorization || "").trim();
    let token = null;

    // Strict: accept only Bearer token or cookie fallback.
    const bearerMatch = rawAuth.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch) {
      token = bearerMatch[1];
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Admin token missing" });
    }

    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      console.error("[adminAuth] ADMIN_JWT_SECRET missing");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Admin token expired" });
      }
      return res.status(401).json({ message: "Invalid admin token" });
    }

    // minimal claim check
    if (!payload || (payload.role !== "admin" && !payload.isAdmin)) {
      return res.status(403).json({ message: "Forbidden: insufficient privileges" });
    }

    // Attach admin detail
    req.admin = { id: payload.id, username: payload.username, role: payload.role || "admin" };
    next();
  } catch (err) {
    console.error("[adminAuth] unexpected error:", err);
    return res.status(401).json({ message: "Invalid admin token" });
  }
}
