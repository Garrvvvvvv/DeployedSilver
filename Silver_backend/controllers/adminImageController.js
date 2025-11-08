// controllers/adminImageController.js  (ESM)

import { v2 as cloudinary } from "cloudinary";
import Image from "../models/Image.js";
import streamifier from "streamifier";

/* -------------------------------
 * Cloudinary Configuration
 * ------------------------------- */
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    "[adminImageController] Missing Cloudinary envs. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/* -------------------------------
 * Helper: upload buffer to Cloudinary using stream
 * ------------------------------- */
function uploadBufferToCloudinary(buffer, folder = "silverjubilee") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/* -------------------------------
 * Constants
 * ------------------------------- */
const VALID_CATEGORIES = ["home_announcement", "home_memories", "memories_page"];

/* -------------------------------
 * Upload Image
 * ------------------------------- */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { category } = req.body;
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res
        .status(400)
        .json({ message: `Invalid or missing category. Must be one of: ${VALID_CATEGORIES.join(", ")}` });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, `silverjubilee/${category}`);

    const newImage = await Image.create({
      url: result.secure_url,
      public_id: result.public_id,
      category,
    });

    return res.status(201).json({
      _id: newImage._id,
      url: newImage.url,
      category: newImage.category,
    });
  } catch (err) {
    console.error("uploadImage error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
}

/* -------------------------------
 * Get Images by Category
 * ------------------------------- */
export async function getImages(req, res) {
  try {
    const { category } = req.query;
    const filter = category && VALID_CATEGORIES.includes(category) ? { category } : {};

    const images = await Image.find(filter).sort({
      createdAt: -1,
      uploadedAt: -1,
    });

    return res.json(images);
  } catch (err) {
    console.error("getImages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* -------------------------------
 * Delete Image
 * ------------------------------- */
export async function deleteImage(req, res) {
  try {
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
    return res.status(500).json({ message: "Server error" });
  }
}
