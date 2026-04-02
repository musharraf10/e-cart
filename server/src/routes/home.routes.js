import express from "express";
import { getHomeSections } from "../controllers/home.controller.js";

const router = express.Router();

router.get("/sections", getHomeSections);

export default router;
