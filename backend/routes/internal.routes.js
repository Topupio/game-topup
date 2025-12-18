// routes/internal.routes.js
import express from "express";
import { cleanupUnverifiedUsers } from "../jobs/cleanupUnverifiedUsers.js";

const router = express.Router();

router.post("/cleanup-unverified", async (req, res) => {
    if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    await cleanupUnverifiedUsers();

    res.json({ success: true });
});

export default router;
