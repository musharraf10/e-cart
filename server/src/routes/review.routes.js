import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createReview, listProductReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/:productId", listProductReviews);
router.post("/:productId", protect, createReview);

export default router;

