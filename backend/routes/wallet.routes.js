import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { sensitiveLimiter } from "../middlewares/rateLimit.middleware.js";
import {
    getMyWallet,
    getMyTransactions,
    getMyTopups,
    getPublicWalletSettings,
} from "../controllers/wallet.controller.js";
import {
    initiateUpiTopup,
    submitTopupUtr,
    getTopup,
    listTopups,
    approveTopup,
    rejectTopup,
} from "../controllers/walletTopup.controller.js";
import { initiateCryptoTopup } from "../controllers/walletCrypto.controller.js";
import {
    listWallets,
    getUserWallet,
    getUserTransactions,
    creditWallet,
    debitWallet,
    setWalletStatus,
    listTransactions,
    getWalletStats,
    getSettings,
    updateSettings,
    getLatestAudit,
    runAuditNow,
} from "../controllers/walletAdmin.controller.js";

const router = Router();

// --- Public ---
router.get("/settings/public", getPublicWalletSettings);

// --- Customer ---
router.get("/me", protect, getMyWallet);
router.get("/me/transactions", protect, getMyTransactions);
router.get("/me/topups", protect, getMyTopups);

router.post("/topups/upi/initiate", sensitiveLimiter, protect, initiateUpiTopup);
router.post("/topups/usdt/initiate", sensitiveLimiter, protect, initiateCryptoTopup);
router.post("/topups/:id/utr", sensitiveLimiter, protect, submitTopupUtr);
router.get("/topups/:id", protect, getTopup);

// --- Admin ---
// Every route that moves money requires a reason, enforced in the controller and
// again by the ledger schema.
router.get("/admin/stats", protect, authorize("admin"), getWalletStats);

router.get("/admin/topups", protect, authorize("admin"), listTopups);
router.post("/admin/topups/:id/approve", sensitiveLimiter, protect, authorize("admin"), approveTopup);
router.post("/admin/topups/:id/reject", sensitiveLimiter, protect, authorize("admin"), rejectTopup);

router.get("/admin/transactions", protect, authorize("admin"), listTransactions);

router.get("/admin/wallets", protect, authorize("admin"), listWallets);
router.get("/admin/wallets/:userId", protect, authorize("admin"), getUserWallet);
router.get("/admin/wallets/:userId/transactions", protect, authorize("admin"), getUserTransactions);
router.post("/admin/wallets/:userId/credit", sensitiveLimiter, protect, authorize("admin"), creditWallet);
router.post("/admin/wallets/:userId/debit", sensitiveLimiter, protect, authorize("admin"), debitWallet);
router.patch("/admin/wallets/:userId/status", protect, authorize("admin"), setWalletStatus);

router.get("/admin/settings", protect, authorize("admin"), getSettings);
router.put("/admin/settings", protect, authorize("admin"), updateSettings);

router.get("/admin/audit/latest", protect, authorize("admin"), getLatestAudit);
router.post("/admin/audit/run", sensitiveLimiter, protect, authorize("admin"), runAuditNow);

export default router;
