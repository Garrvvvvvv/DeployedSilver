// middleware/auth.js  (ESM)

import jwt from "jsonwebtoken";

export default function requireAdmin(req, res, next) {
  try {
    // Read token from "Authorization: Bearer <token>" OR cookie "adminToken"
    const hdr = req.headers.authorization || req.headers.Authorization || "";
    let token = null;

    if (typeof hdr === "string" && hdr.startsWith("Bearer ")) {
      token = hdr.slice(7).trim();
    }
    if (!token && req.cookies?.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Missing admin token" });
    }

    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error("[auth] ADMIN_JWT_SECRET or JWT_SECRET is not set");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const decoded = jwt.verify(token, secret);

    // Optional: if a role is present in token, enforce admin
    if (decoded.role && decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Attach useful fields for downstream handlers
    req.admin = {
      id: decoded.sub || decoded.id || null,
      email: decoded.email || null,
      username: decoded.username || null,
      role: decoded.role || "admin",
      tokenId: decoded.jti || null,
    };

    return next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid or malformed token" });
  }
}
