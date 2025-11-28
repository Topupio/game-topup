import { Router } from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getSingleProduct,
} from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public: list products and get single by slug
router.get("/", getProducts);
router.get("/:slug", getSingleProduct);

// Admin only: create, update, delete products
router.post("/", protect, authorize("admin"), upload.single("image"), createProduct);
router.put("/:id", protect, authorize("admin"), upload.single("image"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
