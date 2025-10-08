const express = require("express");
const router = express.Router();
const { registerEvent, getAllRegistrations } = require("../controllers/eventController");

// POST /api/event/register
router.post("/register", registerEvent);

// GET /api/event/registrations (for admin later)
router.get("/registrations", getAllRegistrations);

module.exports = router;
