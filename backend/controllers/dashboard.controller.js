import { asyncHandler } from "../middlewares/asyncHandler.js";
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import AdminActivityLog from '../models/adminLog.model.js';
import mongoose from "mongoose";

// Revenue = paid orders in USD. The Payment collection misses UPI/manual payments,
// and summing other currencies as USD would inflate totals.
const PAID_USD = { paymentStatus: "paid", currency: "USD" };

// % change rounded to 1 decimal; null when there is no previous value to compare against
const pctChange = (current, previous) =>
    previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;

const periodCounts = async (Model, last30Start, prev30Start) => {
    const [last30, prev30] = await Promise.all([
        Model.countDocuments({ createdAt: { $gte: last30Start } }),
        Model.countDocuments({ createdAt: { $gte: prev30Start, $lt: last30Start } })
    ]);
    return { last30, prev30 };
};

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

    const DAY = 24 * 60 * 60 * 1000;
    const yesterdayStart = new Date(todayStart.getTime() - DAY);
    const chartStart = new Date(todayStart.getTime() - 6 * DAY); // last 7 days incl. today
    const prevWeekStart = new Date(weekStart.getTime() - 7 * DAY);
    const last30Start = new Date(Date.now() - 30 * DAY);
    const prev30Start = new Date(Date.now() - 60 * DAY);
    const waitingThreshold = new Date(Date.now() - DAY);

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
        failedPaymentsToday,

        // Charts / trends / insights
        dailyOrders,
        dailyRevenue,
        statusBreakdown,
        paymentMethodSplit,
        orderPeriods,
        userPeriods,
        revenuePeriods,
        ordersWaitingOver24h,
        topProductAgg

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
        Order.aggregate([
            { $match: PAID_USD },
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
        }),

        // ---------------- Charts ----------------
        Order.aggregate([
            { $match: { createdAt: { $gte: chartStart } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, value: { $sum: 1 } } }
        ]),

        Order.aggregate([
            { $match: { ...PAID_USD, createdAt: { $gte: chartStart } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, value: { $sum: "$amount" } } }
        ]),

        Order.aggregate([{ $group: { _id: "$orderStatus", value: { $sum: 1 } } }]),

        Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: "$paymentMethod", value: { $sum: 1 } } }
        ]),

        // ---------------- Trend periods (last 30d vs previous 30d) ----------------
        periodCounts(Order, last30Start, prev30Start),
        periodCounts(User, last30Start, prev30Start),

        Order.aggregate([
            { $match: { ...PAID_USD, createdAt: { $gte: prev30Start } } },
            {
                $facet: {
                    last30: [{ $match: { createdAt: { $gte: last30Start } } }, { $group: { _id: null, value: { $sum: "$amount" } } }],
                    prev30: [{ $match: { createdAt: { $lt: last30Start } } }, { $group: { _id: null, value: { $sum: "$amount" } } }],
                    yesterday: [{ $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } } }, { $group: { _id: null, value: { $sum: "$amount" } } }],
                    prevWeek: [{ $match: { createdAt: { $gte: prevWeekStart, $lt: weekStart } } }, { $group: { _id: null, value: { $sum: "$amount" } } }]
                }
            }
        ]),

        // ---------------- Insights ----------------
        Order.countDocuments({
            orderStatus: { $in: ["paid", "processing"] },
            createdAt: { $lt: waitingThreshold }
        }),

        Order.aggregate([
            { $match: { createdAt: { $gte: weekStart }, paymentStatus: "paid" } },
            // snapshot name: survives product deletion
            { $group: { _id: "$productSnapshot.name", count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ])
    ]);

    // -------------------------
    // Format revenue safely
    // -------------------------
    const revenueData = revenueAgg[0] || {};

    const totalRevenue = revenueData.total?.[0]?.value || 0;
    const todayRevenue = revenueData.today?.[0]?.value || 0;
    const weekRevenue = revenueData.week?.[0]?.value || 0;

    const revPeriods = revenuePeriods[0] || {};
    const sumOf = (key) => revPeriods[key]?.[0]?.value || 0;
    const prevWeekRevenue = sumOf("prevWeek");

    // ---------------- Charts ----------------
    const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.value]));
    const ordersByDay = toMap(dailyOrders);
    const revenueByDay = toMap(dailyRevenue);

    const daily = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(chartStart.getTime() + i * DAY);
        const key = d.toISOString().slice(0, 10);
        return {
            name: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
            orders: ordersByDay[key] || 0,
            revenue: Math.round((revenueByDay[key] || 0) * 100) / 100
        };
    });

    const toPairs = (rows) => rows
        .filter((r) => r._id)
        .map((r) => ({ name: r._id, value: r.value }))
        .sort((a, b) => b.value - a.value);

    // ---------------- Insights ----------------
    const insights = [];

    if (ordersWaitingOver24h > 0) {
        insights.push({ type: "warning", message: `${ordersWaitingOver24h} paid order(s) waiting for more than 24 hours` });
    }

    const topProduct = topProductAgg[0];
    if (topProduct?._id) {
        insights.push({ type: "top", message: `${topProduct._id} is the most sold product this week (${topProduct.count} orders)` });
    }

    const weekChange = pctChange(weekRevenue, prevWeekRevenue);
    if (weekChange !== null) {
        insights.push({
            type: weekChange >= 0 ? "up" : "down",
            message: `Revenue ${weekChange >= 0 ? "up" : "down"} ${Math.abs(weekChange)}% compared to last week`
        });
    }

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

        charts: {
            daily,
            orderStatus: toPairs(statusBreakdown),
            paymentMethods: toPairs(paymentMethodSplit)
        },

        // % change: last 30 days vs previous 30 days (today's revenue vs yesterday)
        trends: {
            orders: pctChange(orderPeriods.last30, orderPeriods.prev30),
            users: pctChange(userPeriods.last30, userPeriods.prev30),
            revenue: pctChange(sumOf("last30"), sumOf("prev30")),
            todayRevenue: pctChange(todayRevenue, sumOf("yesterday"))
        },

        insights,

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
