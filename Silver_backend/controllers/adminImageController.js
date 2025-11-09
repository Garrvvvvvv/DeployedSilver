// controllers/adminImageController.js (ESM)

import { v2 as cloudinary } from "cloudinary";
import Image from "../models/Image.js";
import streamifier from "streamifier";

let cloudinaryIsConfigured = false;
function ensureCloudinaryConfigured() {
  if (cloudinaryIsConfigured) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  cloudinaryIsConfigured = true;
}

function uploadBufferToCloudinary(buffer, folder = "silverjubilee") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

const VALID_CATEGORIES = ["home_announcement", "home_memories", "memories_page"];

export async function uploadImage(req, res) {
  try {
    console.debug("[uploadImage] content-type:", req.headers["content-type"]);
    console.debug("[uploadImage] headers authorization:", !!req.headers.authorization);
    console.debug("[uploadImage] req.body keys:", req.body ? Object.keys(req.body) : req.body);
    console.debug("[uploadImage] req.file present:", !!req.file);

    // Validate category from body (works for both multipart and JSON)
    const category = (req.body?.category || "").trim();
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Invalid or missing category. Valid: ${VALID_CATEGORIES.join(", ")}` });
    }

    // Preferred path: multipart upload parsed by Multer
    if (req.file && req.file.buffer) {
      const MAX_BYTES = 8 * 1024 * 1024;
      if (req.file.size > MAX_BYTES) return res.status(400).json({ message: "File too large (max 8MB)" });

      const allowedMimes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/jpg"];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: `Unsupported image format: ${req.file.mimetype}` });
      }

      ensureCloudinaryConfigured();
      const folder = `silverjubilee/${category}`;
      const result = await uploadBufferToCloudinary(req.file.buffer, folder);

      if (!result?.secure_url || !result?.public_id) {
        console.error("[uploadImage] Cloudinary result unexpected:", result);
        return res.status(500).json({ message: "Failed to store image" });
      }

      const newImage = await Image.create({
        url: result.secure_url,
        public_id: result.public_id,
        category,
      });
      return res.status(201).json({ _id: newImage._id, url: newImage.url, category: newImage.category });
    }

    // Fallback path: accept base64 data URL in req.body.image
    const b64 = req.body?.image;
    const isDataUrl = typeof b64 === "string" && /^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(b64);
    if (isDataUrl) {
      ensureCloudinaryConfigured();
      const folder = `silverjubilee/${category}`;
      const result = await cloudinary.uploader.upload(b64, { folder });

      if (!result?.secure_url || !result?.public_id) {
        console.error("[uploadImage] Cloudinary b64 result unexpected:", result);
        return res.status(500).json({ message: "Failed to store image" });
      }

      const newImage = await Image.create({
        url: result.secure_url,
        public_id: result.public_id,
        category,
      });
      return res.status(201).json({ _id: newImage._id, url: newImage.url, category: newImage.category });
    }

    // If we got here, the request wasn't parsed as multipart and no base64 provided
    return res.status(400).json({
      message:
        "No file uploaded. Send multipart/form-data with field 'image' (binary) and 'category', or a base64 data URL in 'image'.",
    });
  } catch (err) {
    if (err?.name === "MulterError") {
      console.warn("[uploadImage] multer error:", err.message);
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    console.error("[uploadImage] unexpected error:", err);
    return res.status(500).json({ message: "Upload failed", error: err?.message });
  }
}

export async function getImages(req, res) {
  try {
    const { category } = req.query;
    const filter = category && VALID_CATEGORIES.includes(category) ? { category } : {};
    const images = await Image.find(filter).sort({ createdAt: -1, uploadedAt: -1 });
    return res.json(images);
  } catch (err) {
    console.error("getImages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteImage(req, res) {
  try {
    ensureCloudinaryConfigured();
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    try {
      await cloudinary.uploader.destroy(image.public_id);
    } catch (e) {
      console.warn("Cloudinary destroy warning:", e?.message || e);
    }

    await image.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteImage error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export { VALID_CATEGORIES };
