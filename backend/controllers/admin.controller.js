import User from "../models/user.model.js";
import AdminActivityLog from "../models/adminLog.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { sendAuthPair } from "../utils/token.js";
import { logAdminActivity } from "../utils/adminLogger.js";

// adminLogin function handles admin login
export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "admin") {
        res.status(401);
        throw new Error("Invalid admin credentials");
    }

    // compare password
    const match = await user.comparePassword(password);
    if (!match) {
        res.status(401);
        throw new Error("Invalid admin credentials");
    }

    // 🚫 Blocked status check
    if (user.status === "blocked") {
        res.status(403);
        throw new Error("Your admin account has been suspended.");
    }

    const authResponse = await sendAuthPair(user, 200, res, req.ip);

    // ✅ Update Last Login & Log Activity
    user.lastLoginAt = Date.now();
    await user.save({ validateBeforeSave: false });

    logAdminActivity(req, {
        admin: user._id, // Manual override as req.user might not be set yet during login
        action: "LOGIN",
        module: "dashboard",
        description: `Admin logged in: ${user.email}`
    });

    return authResponse;
});

// adminMe function handles admin me endpoint
export const adminMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
});

/**
 * @desc    Fetch administrative activity logs with pagination and filtering
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
export const getAdminLogs = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        module,
        admin,
        action,
        startDate,
        endDate
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Building the Filter Object
    const query = {};

    if (module) query.module = module;
    if (admin) query.admin = admin;
    if (action) query.action = action;

    // Date Range Filtering
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Inclusion of the full end-day
            query.createdAt.$lte = end;
        }
    }

    // High-performance Fetch with Population
    // Standardizing population to exclude sensitive fields
    const [logs, total] = await Promise.all([
        AdminActivityLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("admin", "name email role")
            .lean(),
        AdminActivityLog.countDocuments(query)
    ]);

    return res.status(200).json({
        success: true,
        data: {
            logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        }
    });
});
