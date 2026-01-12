import { asyncHandler } from "../middlewares/asyncHandler.js";
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import AdminActivityLog from '../models/adminLog.model.js';

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

    // -------------------------
    // Execute queries in parallel
    // -------------------------
    const [
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        todayOrders,

        totalUsers,
        blockedUsers,
        newUsersToday,

        revenueAgg,

        recentOrders,
        recentActivity
    ] = await Promise.all([

        // Orders
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "processing" }),
        Order.countDocuments({ orderStatus: "completed" }),
        Order.countDocuments({ createdAt: { $gte: todayStart } }),

        // Users
        User.countDocuments(),
        User.countDocuments({ status: "blocked" }),
        User.countDocuments({ createdAt: { $gte: todayStart } }),

        // Revenue (single efficient aggregation)
        Payment.aggregate([
            { $match: { status: "success" } },
            {
                $facet: {
                    total: [
                        { $group: { _id: null, value: { $sum: "$amount" } } }
                    ],
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

        // Recent Orders
        Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("orderId amount unitPrice quantity orderStatus paymentStatus createdAt user product")
            .populate("user", "name email")
            .populate("product", "name")
            .populate("game", "name")
            .lean(),

        // Admin Activity
        AdminActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("action createdAt admin")
            .populate("admin", "name email")
    ]);

    // -------------------------
    // Format revenue output safely
    // -------------------------
    const revenueData = revenueAgg[0] || {};

    const totalRevenue = revenueData.total?.[0]?.value || 0;
    const todayRevenue = revenueData.today?.[0]?.value || 0;
    const weekRevenue = revenueData.week?.[0]?.value || 0;

    // -------------------------
    // Final Response
    // -------------------------
    console.log("Recent Orders:", recentOrders);
    // console.log("Recent Activity:", recentActivity);
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
        recentActivity
    });
});