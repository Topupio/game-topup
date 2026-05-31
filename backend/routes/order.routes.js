import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    createOrder,
    getMyOrders,
    getOrderDetails,
    getRecentReviewEligibleOrder,
    getGameReviewEligibleOrder,
    submitOrderReview,
    getRecentPublicOrders,
    adminGetOrders,
    adminUpdateOrder
} from "../controllers/order.controller.js";

const router = express.Router();

// User routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/review-eligible/recent", protect, getRecentReviewEligibleOrder);
router.get("/review-eligible/game/:gameId", protect, getGameReviewEligibleOrder);
router.post("/:id/review", protect, submitOrderReview);
router.get("/recent-public", getRecentPublicOrders);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), adminGetOrders);
router.patch("/admin/:id", protect, authorize("admin"), adminUpdateOrder);

router.get("/:id", protect, getOrderDetails);

export default router;
