import cron from "node-cron";
import { cleanupUnverifiedUsers } from "./cleanupUnverifiedUsers.js";
import { expirePendingOrders } from "./expirePendingOrders.js";

export function startCronJobs() {
    // Cleanup unverified users — every day at 3:00 AM
    cron.schedule("0 3 * * *", async () => {
        try {
            await cleanupUnverifiedUsers();
            console.log("[CRON] Cleaned up unverified users");
        } catch (err) {
            console.error("[CRON] cleanupUnverifiedUsers failed:", err);
        }
    });

    // Expire stale pending orders — every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
        try {
            const result = await expirePendingOrders();
            if (result.expired > 0) {
                console.log(`[CRON] Expired ${result.expired} pending orders`);
            }
        } catch (err) {
            console.error("[CRON] expirePendingOrders failed:", err);
        }
    });

    console.log("[CRON] Scheduled jobs started");
}
