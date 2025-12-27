import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        imageUrl: {
            type: String, // Cloudinary URL or asset URL
            default: null,
        },

        imagePublicId: {
            type: String, // Cloudinary public ID for image management
            default: null,
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

        deliveryTime: {
            type: String,
            default: "Instant Delivery",
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
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
