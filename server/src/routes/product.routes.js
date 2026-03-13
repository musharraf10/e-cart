import express from "express";
import {
  listProducts,
  getProductBySlug,
  searchProducts,
  getRelatedProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/search", searchProducts);
router.get("/related/:productId", getRelatedProducts);
router.get("/:slug", getProductBySlug);

export default router;
