import { Router } from "express";
import {
    getAllRates,
    bulkUpdateRates,
    deleteRate,
} from "../controllers/exchangeRate.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Public
router.get("/", getAllRates);

// Admin only
router.put("/", protect, authorize("admin"), bulkUpdateRates);
router.delete("/:id", protect, authorize("admin"), deleteRate);

export default router;
