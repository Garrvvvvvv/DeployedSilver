const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  batch: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        const year = Number(v);
        return year >= 1956 && year <= 2028;
      },
      message: props => `${props.value} is not a valid batch year! (must be between 1956 and 2028)`
    }
  },

  contact: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{10}$/, "Please provide a valid 10-digit contact number"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  linkedin: {
    type: String,
    required: false,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
      "Please provide a valid LinkedIn profile URL",
    ],
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

// ensure unique email
registrationSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
