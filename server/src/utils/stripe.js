import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
// Stripe secret key must remain on the backend only.
const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey
  ? new Stripe(secretKey, { apiVersion: "2024-06-20" })
  : null;
