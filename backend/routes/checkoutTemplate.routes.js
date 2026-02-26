import { Router } from "express";
import { getAllTemplates, getTemplate, updateTemplate } from "../controllers/checkoutTemplate.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", getAllTemplates);
router.get("/:key", getTemplate);
router.put("/:key", protect, authorize("admin"), updateTemplate);

export default router;
