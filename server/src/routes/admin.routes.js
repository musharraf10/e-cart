import express from "express";
import { protect, admin } from "../middleware/auth.middleware.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";
import {
  getDashboardMetrics,
  adminListProducts,
  adminGetProductById,
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
  adminUpdateCoupon,
  adminToggleCouponActive,
  adminDeleteCoupon,
  adminListDrops,
  adminCreateDrop,
  adminActivateDrop,
  adminListReturns,
  adminUpdateReturnStatus,
  adminGetAnalytics,
  adminGetNotifications,
  adminListAnnouncements,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminToggleAnnouncement,
  adminDeleteAnnouncement,
  adminGetSettings,
  adminUpdateSettings,
  adminUploadImage,
} from "../controllers/admin.controller.js";
import { answerProductQuestion } from "../controllers/qa.controller.js";

const router = express.Router();

router.use(protect, admin);

router.get("/dashboard", getDashboardMetrics);
router.get("/notifications", adminGetNotifications);

router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.post("/uploads/image", uploadSingleImage, adminUploadImage);
router.get("/products", adminListProducts);
router.get("/products/:id", adminGetProductById);
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
router.put("/coupons/:id", adminUpdateCoupon);
router.patch("/coupons/:id/toggle", adminToggleCouponActive);
router.delete("/coupons/:id", adminDeleteCoupon);

router.get("/announcements", adminListAnnouncements);
router.post("/announcements", adminCreateAnnouncement);
router.put("/announcements/:id", adminUpdateAnnouncement);
router.patch("/announcements/:id/toggle", adminToggleAnnouncement);
router.delete("/announcements/:id", adminDeleteAnnouncement);

router.get("/drops", adminListDrops);
router.post("/drops", adminCreateDrop);
router.patch("/drops/:id/activate", adminActivateDrop);

router.get("/returns", adminListReturns);
router.patch("/returns/:id/status", adminUpdateReturnStatus);

router.get("/analytics", adminGetAnalytics);
router.get("/settings", adminGetSettings);
router.put("/settings", adminUpdateSettings);

// Q&A: answers (admin-only via router.use(protect, admin))
router.patch("/questions/:id/answer", answerProductQuestion);

export default router;
