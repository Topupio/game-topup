import { Router } from "express";
import { handleWebhook } from "../controllers/gamersWorkshop.controller.js";

const router = Router();

router.post("/gamers-workshop", handleWebhook);

export default router;
