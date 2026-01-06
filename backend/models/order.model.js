import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true,
            required: true,
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
        },

        // Payment details
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },

        paymentMethod: {
            type: String,
            enum: ["razorpay", "stripe", "wallet", "binancePay"],
            default: "binancePay",
        },

        paymentInfo: {
            transactionId: { type: String },
            paymentGatewayResponse: { type: Object }, // optional raw response
        },

        // Required fields collected from UI (like email, playerId, server)
        userInputs: [
            {
                label: { type: String, required: true }, // "Player ID"
                value: { type: mongoose.Schema.Types.Mixed, required: true },
            },
        ],

        // Admin workflow
        orderStatus: {
            type: String,
            enum: [
                "pending",        // (order created but not paid)
                "paid",           // (payment success)
                "processing",     // (admin working)
                "completed",      // (top-up done)
                "cancelled",      // (admin/user cancelled)
                "failed",         // (admin failed to top-up)
            ],
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