import express from "express";
import {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog,
} from "../controllers/blog.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:idOrSlug", getSingleBlog);

// Admin routes
router.post("/", protect, authorize("admin"), upload.single("coverImage"), createBlog);
router.put("/:id", protect, authorize("admin"), upload.single("coverImage"), updateBlog);
router.delete("/:id", protect, authorize("admin"), deleteBlog);

export default router;
