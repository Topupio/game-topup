import mongoose from "mongoose";

const requiredFieldSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        required: true,
    },
    fieldKey: {
        type: String,
        required: true,
    },
    fieldType: {
        type: String,
        enum: ["text", "number", "email", "dropdown"],
        default: "text",
    },
    placeholder: {
        type: String,
    },
    options: {
        type: [String], // only for dropdowns
        default: [],
    },
    required: {
        type: Boolean,
        default: true,
    },
});

const gameSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        topupType: {
            type: String,
            required: true,
            trim: true,
        },

        imageUrl: {
            type: String,
            required: false,
            default: null,
        },

        imagePublicId: {
            type: String,
            required: false,
            default: null,
        },

        description: {
            type: String,
            default: "",
        },

        // Dynamic required fields for order form
        requiredFields: {
            type: [requiredFieldSchema],
            default: [],
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        // SEO fields
        metaTitle: {
            type: String,
            default: "",
        },

        metaDescription: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Game", gameSchema);