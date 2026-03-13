import express from "express";
import { protect, admin } from "../middleware/auth.middleware.js";
import {
  getDashboardMetrics,
  adminListProducts,
  adminCreateProduct,
  adminListCategories,
  adminCreateCategory,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleVisibility,
  adminMarkNewDrop,
  adminListOrders,
  adminUpdateOrderStatus,
  adminListReviews,
  adminApproveReview,
  adminRejectReview,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, admin);

router.get("/dashboard", getDashboardMetrics);

router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.get("/products", adminListProducts);
router.post("/products", adminCreateProduct);
router.put("/products/:id", adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);
router.patch("/products/:id/visibility", adminToggleVisibility);
router.patch("/products/:id/new-drop", adminMarkNewDrop);

router.get("/orders", adminListOrders);
router.patch("/orders/:id/status", adminUpdateOrderStatus);

router.get("/reviews", adminListReviews);
router.patch("/reviews/:id/approve", adminApproveReview);
router.patch("/reviews/:id/reject", adminRejectReview);

export default router;

