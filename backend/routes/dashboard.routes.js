import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    getDashboardData
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// Admin routes
router.get("/", protect, authorize("admin"), getDashboardData);

export default router;