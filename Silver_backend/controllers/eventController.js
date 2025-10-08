const Registration = require("../models/Registration");
exports.registerEvent = async (req, res) => {
  try {
    const { name, batch, contact, email, linkedin } = req.body;
    if (!name || !batch || !contact || !email) {
      return res.status(400).json({ message: "Name, batch, contact, and email are required" });
    }
    
    const existing = await Registration.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // Save new registration
    const registration = new Registration({
      name,
      batch,
      contact,
      email,
      linkedin,
    });

    await registration.save();
    res.status(201).json({ message: "Registered successfully!" });
  } catch (error) {
    console.error("Error in registerEvent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all registrations (for admin later)
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Server error" });
  }
};
