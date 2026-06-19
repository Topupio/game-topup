import { Router } from "express";
import {
    getAllTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
} from "../controllers/checkoutTemplate.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", getAllTemplates);
router.get("/:key", getTemplate);
router.post("/", protect, authorize("admin"), createTemplate);
router.put("/:key", protect, authorize("admin"), updateTemplate);
router.delete("/:key", protect, authorize("admin"), deleteTemplate);

export default router;
