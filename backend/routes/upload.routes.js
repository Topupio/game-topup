import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/image", protect, authorize("admin"), upload.single("image"), uploadImage);

export default router;
