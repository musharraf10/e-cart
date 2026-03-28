import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createReview,
  listProductReviews,
} from "../controllers/review.controller.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

router.get("/:productId", listProductReviews);

const reviewsUploadDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "uploads",
  "reviews",
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(reviewsUploadDir)) {
        fs.mkdirSync(reviewsUploadDir, { recursive: true });
      }
      cb(null, reviewsUploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)
      ? ext
      : ".jpg";
    cb(null, `review_${req.user._id}_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const mime = file.mimetype || "";
  if (mime.startsWith("image/")) return cb(null, true);
  return cb(new Error("Only image files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 5, fileSize: 5 * 1024 * 1024 }, // 5 images, 5MB each
});

function maybeUploadImages(req, res, next) {
  // Preserve existing JSON payload behavior for clients that don't send multipart.
  if (req.is("multipart/form-data")) {
    return upload.fields([
      { name: "images", maxCount: 5 },
      { name: "photos", maxCount: 5 },
    ])(req, res, (err) => {
      if (err) {
        return next(err);
      }

      const uploaded = [
        ...(req.files?.images || []),
        ...(req.files?.photos || []),
      ].slice(0, 5);
      req.files = uploaded;
      return next();
    });
  }
  return next();
}

router.post("/:productId", protect, maybeUploadImages, createReview);

export default router;
