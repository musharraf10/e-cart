import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrder,
  createPendingOrder,
  listMyOrders,
  getOrderById,
  getOrderStatus,
  downloadOrderInvoice,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.post("/create-pending", protect, createPendingOrder);
router.get("/me", protect, listMyOrders);
router.get("/status/:orderId", protect, getOrderStatus);
router.get("/:id/invoice", protect, downloadOrderInvoice);
router.get("/:id", protect, getOrderById);

export default router;
