import mongoose from "mongoose";
import GameReview from "../models/gameReview.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { logAdminActivity } from "../utils/adminLogger.js";

const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const getGameReviews = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return res.status(400).json({ success: false, message: "Invalid game id" });
    }

    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 6));

    const [reviews, summary] = await Promise.all([
        GameReview.find({ game: gameId })
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
        GameReview.aggregate([
            { $match: { game: new mongoose.Types.ObjectId(gameId) } },
            {
                $group: {
                    _id: "$game",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]),
    ]);

    res.status(200).json({
        success: true,
        data: {
            reviews,
            summary: summary[0]
                ? {
                    averageRating: Number(summary[0].averageRating.toFixed(1)),
                    totalReviews: summary[0].totalReviews,
                }
                : {
                    averageRating: 0,
                    totalReviews: 0,
                },
        },
    });
});

export const adminGetReviews = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { search = "" } = req.query;

    const query = {};
    if (search && search.length <= 80) {
        query.comment = { $regex: search, $options: "i" };
    }

    const [reviews, total] = await Promise.all([
        GameReview.find(query)
            .populate("user", "name email")
            .populate("game", "name imageUrl")
            .populate("order", "orderId productSnapshot paymentStatus orderStatus")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        GameReview.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        data: {
            reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        },
    });
});

export const adminDeleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid review id" });
    }

    const review = await GameReview.findById(id)
        .populate("user", "name email")
        .populate("game", "name")
        .populate("order", "orderId");

    if (!review) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }

    await review.deleteOne();

    logAdminActivity(req, {
        action: "DELETE",
        module: "other",
        targetId: review._id,
        targetModel: "GameReview",
        description: `Deleted review for ${review.game?.name || "game"} from ${review.user?.email || "user"}`,
    });

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});
