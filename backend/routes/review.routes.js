import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    adminDeleteReview,
    adminGetReviews,
    getGameReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.get("/games/:gameId", getGameReviews);
router.get("/admin/all", protect, authorize("admin"), adminGetReviews);
router.delete("/admin/:id", protect, authorize("admin"), adminDeleteReview);

export default router;
