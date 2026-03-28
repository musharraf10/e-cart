import express from "express";
import { receiveShippingWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/shipping", receiveShippingWebhook);

export default router;
