// controllers/eventController.js (ESM final)
import * as RegistrationMod from "../models/Registration.js";
const Registration = RegistrationMod.default || RegistrationMod;

const BASE_PRICE = 10000;
const ADDON_PRICE = 5000;

function extractIdentity(req) {
  const headerUid = req.headers["x-oauth-uid"];
  const headerEmail = req.headers["x-oauth-email"];
  const oauthUid = req.body?.oauthUid || req.user?.sub || headerUid || null;
  const oauthEmail = (req.body?.oauthEmail || req.user?.email || headerEmail || "").toLowerCase();
  return { oauthUid, oauthEmail };
}

function parseFamilyMembers(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return sanitizeFamily(raw);
  if (typeof raw === "string" && raw.trim()) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid familyMembers JSON");
    return sanitizeFamily(parsed);
  }
  return [];
}
function sanitizeFamily(arr) {
  return arr
    .map((m) => ({
      name: String(m?.name || "").trim(),
      relation: String(m?.relation || "").trim(),
    }))
    .filter((m) => m.name && m.relation);
}
function computeAmount(comingWithFamily, familyMembers) {
  const extra = Array.isArray(familyMembers) ? familyMembers.length : 0;
  return comingWithFamily ? BASE_PRICE + ADDON_PRICE * extra : BASE_PRICE;
}

export async function registerEvent(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({
        message:
          "Malformed request. Use multipart/form-data and do not set Content-Type manually.",
      });
    }

    const body = req.body;

    const name = String(body.name || "").trim();
    const batch = String(body.batch || "").trim();
    const contact = String(body.contact || "").trim();
    const emailRaw = String(body.email || "").trim();
    const email = emailRaw.toLowerCase();
    const linkedin = body.linkedin ? String(body.linkedin).trim() : undefined;

    if (!name || !batch || !contact || !email) {
      return res.status(400).json({ message: "Name, batch, contact, and email are required" });
    }

    const { oauthUid, oauthEmail } = extractIdentity(req);
    if (!oauthUid || !oauthEmail) {
      return res.status(401).json({ message: "Missing user identity" });
    }

    const existingByUid = await Registration.findOne({ oauthUid });
    if (existingByUid) {
      return res.status(409).json({ message: "You have already registered with this Google account." });
    }

    let family = [];
    try {
      family = parseFamilyMembers(body.familyMembers);
    } catch (e) {
      return res.status(400).json({ message: e.message || "Invalid familyMembers" });
    }

    const comingWithFamily = String(body.comingWithFamily) === "true";
    const amount = computeAmount(comingWithFamily, family);

    const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : undefined;

    const doc = await Registration.create({
      oauthEmail,
      oauthUid: String(oauthUid).trim(),
      name,
      batch,
      contact,
      email: email || oauthEmail,
      linkedin,
      comingWithFamily,
      familyMembers: family,
      amount,
      receiptUrl,
      paymentRef: body.paymentRef ? String(body.paymentRef).trim() : undefined,
      status: "PENDING",
    });

    return res.status(201).json(doc);
  } catch (error) {
    console.error("Error in registerEvent:", error);
    if (error?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "Receipt image too large" });
    if (error?.name === "ValidationError") return res.status(400).json({ message: error.message });
    if (error?.code === 11000) return res.status(409).json({ message: "Duplicate registration" });
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMyRegistration(req, res) {
  try {
    const oauthUid = req.user?.sub || req.headers["x-oauth-uid"] || req.query.oauthUid;
    if (!oauthUid) return res.status(400).json({ message: "Missing oauthUid" });
    const r = await Registration.findOne({ oauthUid });
    if (!r) return res.status(404).json({ message: "No registration found" });
    return res.json(r);
  } catch (error) {
    console.error("Error in getMyRegistration:", error);
    return res.status(500).json({ message: "Failed to fetch registration" });
  }
}

export async function getAllRegistrations(req, res) {
  try {
    const { status } = req.query;
    const q = status ? { status } : {};
    const registrations = await Registration.find(q).sort({ createdAt: -1 });
    return res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateRegistrationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const update = { status };
    if (status === "APPROVED") {
      update.approvedAt = new Date();
      update.approvedBy = req.admin?.email || req.user?.email || req.headers["x-admin-email"] || "admin";
    } else {
      update.approvedAt = undefined;
      update.approvedBy = undefined;
    }
    const updated = await Registration.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ message: "Registration not found" });
    return res.json(updated);
  } catch (error) {
    console.error("Error updating registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
