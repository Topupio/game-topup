import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    createOrder,
    getMyOrders,
    getMyAdminMessages,
    clearMyAdminMessages,
    markAdminMessageRead,
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
router.get("/admin-messages", protect, getMyAdminMessages);
router.patch("/admin-messages/clear", protect, clearMyAdminMessages);
router.get("/review-eligible/recent", protect, getRecentReviewEligibleOrder);
router.get("/review-eligible/game/:gameId", protect, getGameReviewEligibleOrder);
router.post("/:id/review", protect, submitOrderReview);
router.get("/recent-public", getRecentPublicOrders);
router.patch("/:id/admin-message/read", protect, markAdminMessageRead);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), adminGetOrders);
router.patch("/admin/:id", protect, authorize("admin"), adminUpdateOrder);

router.get("/:id", protect, getOrderDetails);

export default router;
