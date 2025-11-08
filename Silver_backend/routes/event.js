// routes/event.js (ESM)

import { Router } from "express";
import * as eventController from "../controllers/eventController.js";

const { registerEvent, getAllRegistrations } = eventController;

const router = Router();

// POST /api/event/register
router.post("/register", registerEvent);

// GET /api/event/registrations (for admin later)
router.get("/registrations", getAllRegistrations);

export default router;
