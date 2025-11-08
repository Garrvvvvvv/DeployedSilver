// routes/adminImageRoutes.js  (ESM)

import { Router } from "express";
import multer from "multer";

// CJS/ESM-safe imports
import * as adminImageController from "../controllers/adminImageController.js";
import * as authMod from "../middleware/authMiddleware.js";

// Works if middleware is exported as default or module.exports
const requireAdmin = authMod.default || authMod;

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/jpg"];
    const ok = allowed.includes(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

// PUBLIC
router.get("/", adminImageController.getImages);

// ADMIN
router.post("/upload", requireAdmin, upload.single("image"), adminImageController.uploadImage);
router.delete("/:id", requireAdmin, adminImageController.deleteImage);

export default router;
