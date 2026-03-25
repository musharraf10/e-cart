import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// console.log("KEY_ID:", keyId);
// console.log("KEY_SECRET:", keySecret);

export const razorpay =
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;
