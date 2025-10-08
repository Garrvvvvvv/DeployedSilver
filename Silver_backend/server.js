require("dotenv").config({ path: "./.env" });

console.log("MONGO_URI:", process.env.MONGO_URI); // this must print your URI
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // ✅ parse JSON requests

// Routes
const eventRoutes = require("./routes/event");
app.use("/api/event", eventRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
