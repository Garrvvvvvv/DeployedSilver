// controllers/adminAuthController.js
import Admin from "../models/Admin.js"; // mongoose model (you already have Admin.js)
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * Create an initial admin (seed). Run once in dev and remove or protect.
 * POST /api/admin/auth/seed
 * body: { username, password }
 */
export async function seedAdmin(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({ username, password });
    await admin.save();

    return res.status(201).json({ message: "Admin seeded" });
  } catch (err) {
    console.error("seedAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/admin/auth/login
 * body: { username, password }
 * returns: { token }
 * Also sets a secure httpOnly cookie named adminToken
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const match = await admin.matchPassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      console.error("ADMIN_JWT_SECRET missing");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    // Short-lived token
    const payload = { id: String(admin._id), username: admin.username, role: "admin" };
    const token = jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "1h" });

    // Set httpOnly secure cookie (defense-in-depth).
    // Cookie will only be set when server is served over HTTPS. For local dev it still allows if secure=false but it's fine to set secure by env.
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/",
    };
    res.cookie("adminToken", token, cookieOptions);

    // Return token in body for existing frontends that expect to store it in localStorage
    return res.json({ token, expiresIn: 3600 });
  } catch (err) {
    console.error("admin login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/admin/auth/logout
 * clears cookie on server-side
 */
export async function logout(req, res) {
  try {
    res.clearCookie("adminToken", { path: "/" });
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("admin logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
