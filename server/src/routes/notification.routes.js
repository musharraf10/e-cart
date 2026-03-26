import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyNotifications, markAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protect);
router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);

export default router;
