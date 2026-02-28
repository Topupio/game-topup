import { Router } from "express";
import {
    createBanner,
    getActiveBanners,
    getAllBannersAdmin,
    getBannerById,
    updateBanner,
    deleteBanner,
} from "../controllers/banner.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public route to get active banners
router.get("/", getActiveBanners);

// Admin routes
router.get("/admin", protect, authorize("admin"), getAllBannersAdmin);
const bannerUpload = upload.fields([{ name: "image", maxCount: 1 }, { name: "mobileImage", maxCount: 1 }]);
router.post("/", protect, authorize("admin"), bannerUpload, createBanner);
router.get("/:id", protect, authorize("admin"), getBannerById);
router.put("/:id", protect, authorize("admin"), bannerUpload, updateBanner);
router.delete("/:id", protect, authorize("admin"), deleteBanner);

export default router;
