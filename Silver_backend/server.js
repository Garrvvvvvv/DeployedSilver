// server.js (ESM, Express v5-safe) — fixed (use RegExp for options preflight)
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// routes (keep your existing files)
import googleAuth from "./routes/googleAuth.js";
import eventRoutes from "./routes/event.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminImageRoutes from "./routes/adminImageRoutes.js";
import adminEventRoutes from "./routes/adminEvent.js"; // default export

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- ENV sanity checks ---------- */
const isProd = process.env.NODE_ENV === "production";
if (!process.env.MONGO_URI) {
  console.warn("[startup] WARNING: MONGO_URI is not set. DB will fail to connect.");
}
if (!process.env.ADMIN_JWT_SECRET) {
  console.warn("[startup] WARNING: ADMIN_JWT_SECRET is not set. Admin auth will not work correctly.");
}
if (!process.env.ALLOWED_ORIGINS) {
  console.warn("[startup] WARNING: ALLOWED_ORIGINS not set — defaulting to http://localhost:5173 (dev-friendly).");
}

/* ---------- CORS from env (robust) ---------- */
function parseOrigins(val) {
  return (val || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
const allowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS);
if (allowedOrigins.length === 0) allowedOrigins.push("http://localhost:5173");

// cors options
const corsOptions = {
  origin(origin, callback) {
    // allow requests with no origin (mobile clients, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // allowedHeaders should list the headers we accept from the browser
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Oauth-Uid",
    "X-Oauth-Email",
    "x-oauth-uid",
    "x-oauth-email",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
};

/* ---------- Basic request logging (concise) ---------- */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ---------- Security & performance middleware ---------- */
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

// Helmet with reasonable defaults
app.use(
  helmet({
    // allow cross-origin images for receipts; tune if needed
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

// Body parsing (keep limits reasonable)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookies
app.use(cookieParser());

// CORS (applies to all routes)
app.use(cors(corsOptions));

// Explicit preflight handler — use RegExp route to avoid path-to-regexp parsing errors
app.options(/.*/, cors(corsOptions));

/* ---------- Static: uploaded receipts (secure-ish) ---------- */
const receiptsDir = path.join(__dirname, "uploads", "receipts");
// ensure dir exists in other code paths (your multer setup already creates it)
app.use(
  "/uploads/receipts",
  express.static(receiptsDir, {
    immutable: true,
    maxAge: "30d",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      // Restrict what can be loaded from this directory
      res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self' data: blob:;");
    },
  })
);

/* ---------- Rate limiters ---------- */
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  message: { message: "Too many login attempts. Try again in 5 minutes." },
});

// Apply rate limiter to admin login endpoint specifically (applies before route registration)
app.use("/api/admin/auth/login", loginLimiter);

/* ---------- Routes (unchanged behavior) ---------- */
app.use("/api/auth", googleAuth);
app.use("/api/event", eventRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/images", adminImageRoutes);
app.use("/api/admin/event", adminEventRoutes);

// Health check
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

/* ---------- 404 handler ---------- */
app.use((req, res) => res.status(404).json({ message: "Not found" }));

/* ---------- Error handler (friendly in prod) ---------- */
app.use((err, req, res, _next) => {
  // Handle CORS errors explicitly
  if (err?.message?.startsWith("CORS blocked for origin:")) {
    return res.status(403).json({ message: err.message });
  }

  // Development: show stack; Production: hide details
  if (!isProd) {
    console.error("Unhandled error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Server error", stack: err.stack });
  } else {
    // production-safe response
    console.error("Unhandled error (prod):", err?.message || err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/* ---------- MongoDB connect & server start ---------- */
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "", {
      // options if needed
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // exit so we don't run without DB
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} (env=${process.env.NODE_ENV || "development"})`);
    if (isProd) {
      console.log("Running in production mode. Ensure ADMIN_JWT_SECRET and other secrets are set.");
    } else {
      console.log("Development mode: CORS allowed origins:", allowedOrigins.join(", "));
    }
  });
};

start();
