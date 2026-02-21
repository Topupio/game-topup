import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    createPayPalOrder,
    capturePayPalOrder,
    handlePayPalWebhook,
    refundPayPalPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

// User routes (auth required)
router.post("/paypal/create-order", protect, createPayPalOrder);
router.post("/paypal/capture-order", protect, capturePayPalOrder);

// Webhook (no auth - verified via PayPal signature)
router.post("/paypal/webhook", handlePayPalWebhook);

// Admin routes
router.post("/paypal/refund", protect, authorize("admin"), refundPayPalPayment);

export default router;
