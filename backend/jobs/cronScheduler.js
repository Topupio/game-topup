import cron from "node-cron";
import { cleanupUnverifiedUsers } from "./cleanupUnverifiedUsers.js";
import { expirePendingOrders } from "./expirePendingOrders.js";
import { runWalletAudit } from "./auditWalletBalances.js";
import { expireWalletTopups } from "./expireWalletTopups.js";

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

    // Reconcile wallet balances against the ledger — every day at 3:30 AM IST.
    // Sunday runs the full recompute; other nights do the quick head check.
    cron.schedule(
        "30 3 * * *",
        async () => {
            try {
                await runWalletAudit({ full: new Date().getDay() === 0 });
            } catch (err) {
                console.error("[CRON] wallet audit failed:", err);
            }
        },
        { timezone: "Asia/Kolkata" }
    );

    // Expire abandoned wallet top-ups — every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
        try {
            const result = await expireWalletTopups();
            if (result.expired > 0) {
                console.log(`[CRON] Expired ${result.expired} wallet top-ups`);
            }
        } catch (err) {
            console.error("[CRON] expireWalletTopups failed:", err);
        }
    });

    console.log("[CRON] Scheduled jobs started");
}
