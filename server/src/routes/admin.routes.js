import express from "express";
import { protect, admin } from "../middleware/auth.middleware.js";
import {
  getDashboardMetrics,
  adminListProducts,
  adminCreateProduct,
  adminBulkUpdateProducts,
  adminListCategories,
  adminCreateCategory,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleVisibility,
  adminMarkNewDrop,
  adminMarkFeatured,
  adminInventoryOverview,
  adminUpdateProductStock,
  adminListOrders,
  adminUpdateOrderStatus,
  adminListCustomers,
  adminToggleCustomerBlock,
  adminDeleteCustomer,
  adminListReviews,
  adminHideReview,
  adminUnhideReview,
  adminDeleteReview,
  adminListCoupons,
  adminCreateCoupon,
  adminListDrops,
  adminCreateDrop,
  adminActivateDrop,
  adminListReturns,
  adminUpdateReturnStatus,
  adminGetAnalytics,
  adminGetNotifications,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, admin);

router.get("/dashboard", getDashboardMetrics);
router.get("/notifications", adminGetNotifications);

router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);

router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);

router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.get("/products", adminListProducts);
router.post("/products", adminCreateProduct);
router.post("/products/bulk", adminBulkUpdateProducts);
router.put("/products/:id", adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);
router.patch("/products/:id/visibility", adminToggleVisibility);
router.patch("/products/:id/new-drop", adminMarkNewDrop);
router.patch("/products/:id/featured", adminMarkFeatured);

router.get("/inventory", adminInventoryOverview);
router.patch("/inventory/:id/stock", adminUpdateProductStock);

router.get("/orders", adminListOrders);
router.patch("/orders/:id/status", adminUpdateOrderStatus);

router.get("/customers", adminListCustomers);
router.patch("/customers/:id/block", adminToggleCustomerBlock);
router.delete("/customers/:id", adminDeleteCustomer);

router.get("/reviews", adminListReviews);
router.patch("/reviews/:id/hide", adminHideReview);
router.patch("/reviews/:id/unhide", adminUnhideReview);
router.delete("/reviews/:id", adminDeleteReview);

router.get("/coupons", adminListCoupons);
router.post("/coupons", adminCreateCoupon);

router.get("/drops", adminListDrops);
router.post("/drops", adminCreateDrop);
router.patch("/drops/:id/activate", adminActivateDrop);

router.get("/returns", adminListReturns);
router.patch("/returns/:id/status", adminUpdateReturnStatus);

router.get("/analytics", adminGetAnalytics);

export default router;
