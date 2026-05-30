import mongoose from "mongoose";

const gameReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
            required: true,
            index: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
    },
    { timestamps: true }
);

gameReviewSchema.index({ game: 1, createdAt: -1 });
gameReviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("GameReview", gameReviewSchema);
