import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  listProducts,
  getProductBySlug,
  searchProducts,
  getRelatedProducts,
} from "../controllers/product.controller.js";
import {
  listProductQuestions,
  createProductQuestion,
  answerProductQuestion,
  markQuestionHelpful,
} from "../controllers/qa.controller.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/search", searchProducts);
router.get("/related/:productId", getRelatedProducts);
// Must be declared before "/:slug" to avoid route ambiguity
router.get("/:productId/questions", listProductQuestions);
router.post("/:productId/questions", protect, createProductQuestion);
router.patch("/questions/:id/answer", protect, answerProductQuestion);
router.patch("/questions/:id/helpful", markQuestionHelpful);
router.get("/:slug", getProductBySlug);

export default router;
