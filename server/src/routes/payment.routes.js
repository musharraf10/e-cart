import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createPaymentIntent, handleStripeWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-payment-intent", protect, createPaymentIntent);

// Stripe webhook must receive the raw body for signature verification.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

export default router;

