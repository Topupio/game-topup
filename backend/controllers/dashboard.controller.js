import { asyncHandler } from "../middlewares/asyncHandler.js";
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import AdminActivityLog from '../models/adminLog.model.js';
import mongoose from "mongoose";

export const getDashboardData = asyncHandler(async (req, res) => {

    // -------------------------
    // Safe UTC date handling
    // -------------------------
    const now = new Date();

    const todayStart = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ));

    const weekStart = new Date(todayStart);
    weekStart.setUTCDate(todayStart.getUTCDate() - 7);

    const stuckThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes

    // -------------------------
    // Execute queries in parallel
    // -------------------------
    const [
        // Orders
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        todayOrders,

        // Users
        totalUsers,
        blockedUsers,
        newUsersToday,

        // Revenue
        revenueAgg,

        // Recent activity
        recentOrders,
        recentActivity,

        // 🧯 Action Required Signals
        ordersToProcess,
        stuckOrders,
        pendingPayments,
        unverifiedUsers,
        failedPaymentsToday

    ] = await Promise.all([

        // ---------------- Orders ----------------
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "processing" }),
        Order.countDocuments({ orderStatus: "completed" }),
        Order.countDocuments({ createdAt: { $gte: todayStart } }),

        // ---------------- Users ----------------
        User.countDocuments(),
        User.countDocuments({ status: "blocked" }),
        User.countDocuments({ createdAt: { $gte: todayStart } }),

        // ---------------- Revenue (Aggregation) ----------------
        Payment.aggregate([
            { $match: { status: "success" } },
            {
                $facet: {
                    total: [{ $group: { _id: null, value: { $sum: "$amount" } } }],
                    today: [
                        { $match: { createdAt: { $gte: todayStart } } },
                        { $group: { _id: null, value: { $sum: "$amount" } } }
                    ],
                    week: [
                        { $match: { createdAt: { $gte: weekStart } } },
                        { $group: { _id: null, value: { $sum: "$amount" } } }
                    ]
                }
            }
        ]),

        // ---------------- Recent Orders ----------------
        Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("orderId amount currency unitPrice quantity orderStatus paymentStatus createdAt user product game")
            .populate("user", "name email")
            .populate("product", "name")
            .populate("game", "name")
            .lean(),

        // ---------------- Admin Activity ----------------
        AdminActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("action description module createdAt admin")
            .populate("admin", "name email")
            .lean(),

        // ---------------- 🧯 Action Required ----------------
        Order.countDocuments({ orderStatus: "paid" }),

        Order.countDocuments({
            orderStatus: "processing",
            updatedAt: { $lt: stuckThreshold }
        }),

        Order.countDocuments({ paymentStatus: "pending" }),

        User.countDocuments({ isVerified: false }),

        Order.countDocuments({
            paymentStatus: "failed",
            createdAt: { $gte: todayStart }
        })
    ]);

    // -------------------------
    // Format revenue safely
    // -------------------------
    const revenueData = revenueAgg[0] || {};

    const totalRevenue = revenueData.total?.[0]?.value || 0;
    const todayRevenue = revenueData.today?.[0]?.value || 0;
    const weekRevenue = revenueData.week?.[0]?.value || 0;

    // ---------------- System Health ----------------
    let databaseStatus = "Disconnected";

    try {
        await mongoose.connection.db.admin().ping();
        databaseStatus = "Connected";
    } catch { }

    const lastSuccessfulPayment = await Payment.findOne({ status: "success" })
        .sort({ updatedAt: -1 })
        .select("updatedAt");

    let paymentGatewayStatus = "Healthy";

    // If no success payment ever, we mark as Offline (or maybe they just started)
    if (!lastSuccessfulPayment) {
        paymentGatewayStatus = "Offline";
    } else {
        const minutesAgo =
            (Date.now() - lastSuccessfulPayment.updatedAt.getTime()) / 60000;

        if (minutesAgo > 60 || failedPaymentsToday > 10) {
            paymentGatewayStatus = "Degraded";
        }
    }

    // -------------------------
    // Final Response
    // -------------------------
    res.json({
        orders: {
            total: totalOrders,
            pending: pendingOrders,
            processing: processingOrders,
            completed: completedOrders,
            today: todayOrders
        },
        users: {
            total: totalUsers,
            blocked: blockedUsers,
            newToday: newUsersToday
        },
        revenue: {
            total: totalRevenue,
            today: todayRevenue,
            thisWeek: weekRevenue
        },
        recentOrders,
        recentActivity,

        // 🧯 Action Required Panel
        actionRequired: {
            ordersToProcess,
            stuckOrders,
            pendingPayments,
            unverifiedUsers,
            failedPaymentsToday
        },

        // 🩺 System Health Snapshot
        systemHealth: {
            server: "Online",
            database: databaseStatus,
            paymentGateway: paymentGatewayStatus,
            emailService: "Unknown"
        }
    });
});
