import mongoose from "mongoose";
import { REGION_KEYS } from "../constants/regions.js";
import { CHECKOUT_TEMPLATE_KEYS } from "../constants/checkoutTemplates.js";

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
        enum: ["text", "number", "email", "password", "dropdown"],
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

const regionPricingSchema = new mongoose.Schema(
    {
        region: {
            type: String,
            required: true,
            enum: REGION_KEYS,
        },
        currency: {
            type: String,
            required: true,
        },
        symbol: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discountedPrice: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: function (value) {
                    return value <= this.price;
                },
                message: "discountedPrice cannot be greater than price",
            },
        },
    },
    { _id: false }
);

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    quantity: {
        type: Number,
        default: null,
    },
    unit: {
        type: String,
        default: "",
        trim: true,
    },
    regionPricing: {
        type: [regionPricingSchema],
        default: [],
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    isPopular: {
        type: Boolean,
        default: false,
    },
    deliveryTime: {
        type: String,
        default: "Instant Delivery",
    },
    imageUrl: {
        type: String,
        default: null,
    },
    imagePublicId: {
        type: String,
        default: null,
    },
    // Checkout template key (per-variant)
    checkoutTemplate: {
        type: String,
        enum: [...CHECKOUT_TEMPLATE_KEYS, ""],
        default: "",
    },
    // Template-specific options (e.g., zoneRequired, custom zone options)
    checkoutTemplateOptions: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
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

        paymentCategory: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        topupType: {
            type: String,
            required: false,
            default: "",
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

        richDescription: {
            type: String,
            default: "",
        },

        // Regions this game is available in
        regions: {
            type: [String],
            default: ["global"],
        },

        // Embedded variants (in-game items / packages)
        variants: {
            type: [variantSchema],
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
