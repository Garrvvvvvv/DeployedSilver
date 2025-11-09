// models/Registration.js (ESM)

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const FamilyMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: {
      type: String,
      required: true,
      trim: true,
      enum: ["Spouse", "Son", "Daughter", "Other"],
    },
  },
  { _id: false }
);

const registrationSchema = new Schema(
  {
    // Google account identifiers (from JWT)
    oauthEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    oauthUid: {
      // Google's "sub" (stable user id)
      type: String,
      required: true,
      trim: true,
      unique: true, // enforce one-time registration per Google account
      index: true,
    },

    // User-typed fields
    name: { type: String, required: true, trim: true },
    batch: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          const year = Number(v);
          return year >= 1956 && year <= 2028;
        },
        message: (props) => `${props.value} is not a valid batch year (1956 — 2028)`,
      },
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
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      // Not unique: multiple users can share a non-Google email, and we enforce uniqueness via oauthUid instead.
    },
    linkedin: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
        "Please provide a valid LinkedIn profile URL",
      ],
    },

    // Family & pricing
    comingWithFamily: { type: Boolean, default: false },
    familyMembers: { type: [FamilyMemberSchema], default: [] },
    amount: { type: Number, required: true, min: 0 }, // ₹10000 alone + ₹5000 per family member

    // Payment proof
    receiptUrl: { type: String, trim: true }, // URL to uploaded receipt image
    paymentRef: { type: String, trim: true }, // optional: UTR/transaction id

    // Approval / moderation
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    approvedAt: { type: Date },
    approvedBy: { type: String, trim: true }, // store admin id/email who approved
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
registrationSchema.virtual("familyCount").get(function () {
  return Array.isArray(this.familyMembers) ? this.familyMembers.length : 0;
});

// Helpful indexes
registrationSchema.index({ createdAt: -1 });
registrationSchema.index({ oauthEmail: 1 });
registrationSchema.index({ status: 1 });

// NOTE: email is intentionally NOT unique now.
// We rely on oauthUid's unique index for single registration per Google account.

const Registration = model("Registration", registrationSchema);
export default Registration;
