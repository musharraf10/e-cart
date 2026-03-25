import express from "express";
import { register, login, googleLogin, getProfile, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

export default router;
