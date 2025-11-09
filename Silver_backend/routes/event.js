// routes/event.js (ESM, final — multer runs FIRST and errors are clean JSON)
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerEvent, getMyRegistration } from "../controllers/eventController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

/* ---------- Ensure uploads folder exists ---------- */
const uploadsDir = path.join(__dirname, "..", "uploads", "receipts");
fs.mkdirSync(uploadsDir, { recursive: true });

/* ---------- Multer storage ---------- */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = String(file.originalname || "receipt")
      .replace(/[^\w.\-]+/g, "_")
      .slice(0, 120);
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file && !String(file.mimetype || "").startsWith("image/")) {
      return cb(new Error("Only image receipts are allowed"));
    }
    cb(null, true);
  },
});

/* ---------- Wrap multer to convert its errors to readable JSON ---------- */
function handleReceiptUpload(req, res, next) {
  upload.single("receipt")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Receipt image too large (max 10 MB)" });
      }
      return res.status(400).json({ message: err.message || "Invalid receipt upload" });
    }
    next();
  });
}

/* ---------- Lightweight identity attach that DOES NOT read req.body ---------- */
function attachUserFromHeaders(req, _res, next) {
  const uid = req.headers["x-oauth-uid"];
  const email = req.headers["x-oauth-email"];
  if (uid || email) req.user = { ...(req.user || {}), sub: uid, email };
  next();
}

/* ROUTES */
router.post("/register", handleReceiptUpload, attachUserFromHeaders, registerEvent);
router.get("/registration/me", attachUserFromHeaders, getMyRegistration);

export default router;
