import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrder,
  createPendingOrder,
  listMyOrders,
  getOrderById,
  getOrderByPaymentIntent,
  verifyPayment,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.post("/create-pending", protect, createPendingOrder);
router.get("/me", protect, listMyOrders);
router.get("/status/:paymentIntentId", protect, getOrderByPaymentIntent);
router.get("/verify-payment/:paymentIntentId", protect, verifyPayment);
router.get("/:id", protect, getOrderById);

export default router;
