import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: "",
        },
        imageUrl: {
            type: String,
            required: [true, "Banner image is required"],
        },
        imagePublicId: {
            type: String,
            required: [true, "Image Public ID is required for management"],
        },
        link: {
            type: String, // Optional URL to redirect to when clicked
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0, // Lower number = appears first
        },
    },
    { timestamps: true }
);

bannerSchema.index({ isActive: 1, order: 1, createdAt: -1 });

export default mongoose.model("Banner", bannerSchema);
