import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrder,
  listMyOrders,
  getOrderById,
  verifyPayment,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/me", protect, listMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/verify-payment/:paymentIntentId", protect, verifyPayment);

export default router;

