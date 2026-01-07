import { asyncHandler } from "../middlewares/asyncHandler.js";
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import AdminActivityLog from '../models/adminLog.model.js';

export const getDashboardData = asyncHandler(async (req, res) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        todayOrders,

        totalUsers,
        blockedUsers,
        newUsersToday,

        totalRevenueAgg,
        todayRevenueAgg,
        weekRevenueAgg,

        recentOrders,
        recentActivity
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "processing" }),
        Order.countDocuments({ orderStatus: "completed" }),
        Order.countDocuments({ createdAt: { $gte: todayStart } }),

        User.countDocuments(),
        User.countDocuments({ status: "blocked" }),
        User.countDocuments({ createdAt: { $gte: todayStart } }),

        Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        Payment.aggregate([{ $match: { status: "success", createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        Payment.aggregate([{ $match: { status: "success", createdAt: { $gte: weekStart } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),

        Order.find().sort({ createdAt: -1 }).limit(10).populate("user product"),
        AdminActivityLog.find().sort({ createdAt: -1 }).limit(10).populate("admin")
    ]);

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
            total: totalRevenueAgg[0]?.total || 0,
            today: todayRevenueAgg[0]?.total || 0,
            thisWeek: weekRevenueAgg[0]?.total || 0
        },
        recentOrders,
        recentActivity
    });
});