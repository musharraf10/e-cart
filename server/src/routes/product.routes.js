import express from "express";
import {
  listProducts,
  getProductBySlug,
  searchProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/search", searchProducts);
router.get("/:slug", getProductBySlug);

export default router;

