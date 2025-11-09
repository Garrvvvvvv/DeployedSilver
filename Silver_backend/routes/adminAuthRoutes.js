// routes/adminAuthRoutes.js
import express from "express";
import { seedAdmin, login, logout } from "../controllers/adminAuthController.js";

const router = express.Router();

// NOTE: /seed is for development only. Remove or protect in production.
router.post("/seed", seedAdmin);
router.post("/login", login);
router.post("/logout", logout);

export default router;
