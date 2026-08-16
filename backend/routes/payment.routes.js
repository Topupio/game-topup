import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    createPayPalOrder,
    capturePayPalOrder,
    handlePayPalWebhook,
    refundPayPalPayment,
    mockPaymentSuccess,
    createNowPaymentsInvoice,
    handleNowPaymentsWebhook,
} from "../controllers/payment.controller.js";
import {
    getPaymentSettings,
    initiateUpiPayment,
    submitUtrNumber,
    updatePaymentSettings,
} from "../controllers/paymentSettings.controller.js";
import {
    quoteWalletPayment,
    payWithWallet,
} from "../controllers/walletPayment.controller.js";
import { sensitiveLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// User routes (auth required)
router.post("/paypal/create-order", protect, createPayPalOrder);
router.post("/paypal/capture-order", protect, capturePayPalOrder);

// Webhook (no auth - verified via PayPal signature)
router.post("/paypal/webhook", handlePayPalWebhook);

// NOWPayments (Crypto) routes
router.post("/nowpayments/create-invoice", protect, createNowPaymentsInvoice);
router.post("/nowpayments/webhook", handleNowPaymentsWebhook);
router.post("/upi/initiate", protect, initiateUpiPayment);
router.post("/upi/submit-utr", protect, submitUtrNumber);

// Wallet. The quote returns the exact amount the server will debit, so checkout can
// confirm against it rather than a figure converted on the client.
router.get("/wallet/quote", protect, quoteWalletPayment);
router.post("/wallet/pay", sensitiveLimiter, protect, payWithWallet);

// Admin routes
router.post("/paypal/refund", protect, authorize("admin"), refundPayPalPayment);
router.get("/settings", protect, authorize("admin"), getPaymentSettings);
router.put("/settings", protect, authorize("admin"), updatePaymentSettings);

// Dev only - mock payment success for testing
router.post("/mock-success", protect, authorize("admin"), mockPaymentSuccess);

export default router;
