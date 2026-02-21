import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
            required: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // Total price paid by customer
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },

        // Payment details
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },

        paymentMethod: {
            type: String,
            enum: ["razorpay", "stripe", "wallet", "binancePay", "paypal"],
            default: "paypal",
        },

        currency: {
            type: String,
            default: "USD",
        },

        paymentInfo: {
            transactionId: { type: String, index: true },
            paymentGatewayResponse: { type: mongoose.Schema.Types.Mixed }, // optional raw response
        },

        // Required fields collected from UI (like email, playerId, server)
        userInputs: {
            type: [
                {
                    label: { type: String, required: true, trim: true },
                    value: { type: mongoose.Schema.Types.Mixed, required: true }
                }
            ],
            default: []
        },

        // Admin workflow
        orderStatus: {
            type: String,
            enum: ["pending", "paid", "processing", "completed", "cancelled", "failed"],
            default: "pending",
        },

        adminNote: {
            type: String,
        },

        completionProof: {
            type: String, // screenshot URL or attachment
        },

        productSnapshot: {
            name: String,
            price: Number,
            discountedPrice: Number,
            deliveryTime: String,
            qty: Number,
            totalAmount: Number,
        },

        tracking: [
            {
                status: String,        // e.g., "processing", "completed"
                message: String,       // "Top-up started", "Delivered successfully"
                at: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderId: 1 });

export default mongoose.model("Order", orderSchema);