import mongoose from "mongoose";
import GameReview from "../models/gameReview.model.js";
import Game from "../models/game.model.js";
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

    const gameObjectId = new mongoose.Types.ObjectId(gameId);

    const [reviews, summary, distribution] = await Promise.all([
        GameReview.find({ game: gameId })
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
        GameReview.aggregate([
            { $match: { game: gameObjectId } },
            {
                $group: {
                    _id: "$game",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]),
        GameReview.aggregate([
            { $match: { game: gameObjectId } },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: -1 } },
        ]),
    ]);

    // Build a { 5: N, 4: N, 3: N, 2: N, 1: N } map
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const d of distribution) {
        ratingDistribution[d._id] = d.count;
    }

    res.status(200).json({
        success: true,
        data: {
            reviews,
            summary: summary[0]
                ? {
                    averageRating: Number(summary[0].averageRating.toFixed(1)),
                    totalReviews: summary[0].totalReviews,
                    ratingDistribution,
                }
                : {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution,
                },
        },
    });
});

export const adminGetReviews = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { search = "", game = "", rating = "", sort = "newest" } = req.query;

    const query = {};
    
    // Search filter
    if (search && search.length <= 80) {
        query.comment = { $regex: search, $options: "i" };
    }

    // Game filter
    if (game && mongoose.Types.ObjectId.isValid(game)) {
        query.game = new mongoose.Types.ObjectId(game);
    }

    // Rating filter
    if (rating) {
        const ratingNum = Number(rating);
        if (ratingNum >= 1 && ratingNum <= 5) {
            query.rating = ratingNum;
        }
    }

    // Sort definition
    let sortObj = { createdAt: -1 };
    if (sort === "oldest") {
        sortObj = { createdAt: 1 };
    } else if (sort === "highest_rating") {
        sortObj = { rating: -1, createdAt: -1 };
    } else if (sort === "lowest_rating") {
        sortObj = { rating: 1, createdAt: -1 };
    }

    // Get reviewed games and standard reviews
    const [reviews, total, reviewedGameIds] = await Promise.all([
        GameReview.find(query)
            .populate("user", "name email")
            .populate("game", "name imageUrl")
            .populate("order", "orderId productSnapshot paymentStatus orderStatus")
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean(),
        GameReview.countDocuments(query),
        GameReview.distinct("game")
    ]);

    const reviewedGames = await Game.find({ _id: { $in: reviewedGameIds } }, "name").sort({ name: 1 }).lean();

    res.status(200).json({
        success: true,
        data: {
            reviews,
            reviewedGames,
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
