// controllers/eventController.js   (ESM safe)

import * as RegistrationMod from "../models/Registration.js";

// support both CommonJS + ESM exports
const Registration = RegistrationMod.default || RegistrationMod;

export async function registerEvent(req, res) {
  try {
    const { name, batch, contact, email, linkedin } = req.body;

    if (!name || !batch || !contact || !email) {
      return res.status(400).json({ message: "Name, batch, contact, and email are required" });
    }

    const existing = await Registration.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const registration = new Registration({
      name,
      batch,
      contact,
      email,
      linkedin,
    });

    await registration.save();
    return res.status(201).json({ message: "Registered successfully!" });
  } catch (error) {
    console.error("Error in registerEvent:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllRegistrations(req, res) {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    return res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
