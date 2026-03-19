import express from "express";
import { listActiveAnnouncements } from "../controllers/admin.controller.js";

const router = express.Router();

// Public endpoint: returns active announcements only
router.get("/", listActiveAnnouncements);

export default router;

