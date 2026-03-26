import express from "express";
import {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

export default router;
