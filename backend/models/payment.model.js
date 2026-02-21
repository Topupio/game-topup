import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // Link payment to order
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Razorpay / Stripe / Wallet etc.
        paymentGateway: {
            type: String,
            enum: ["razorpay", "stripe", "wallet", "binancePay", "paypal"],
            required: true,
        },

        // Status tracking
        status: {
            type: String,
            enum: ["pending", "success", "failed", "refunded"],
            default: "pending",
        },

        // Transaction amounts
        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "USD",
        },

        // UPI / Card / Netbanking / Wallet etc.
        paymentMethod: {
            type: String,
        },

        // IDs returned from payment gateway
        transactionId: {
            type: String, // payment gateway unique ID
        },

        orderId: {
            type: String, // gateway order ID (e.g., Razorpay order ID)
        },

        signature: {
            type: String, // Razorpay only
        },

        // Save full gateway webhook or order response for audits
        gatewayResponse: {
            type: Object,
            default: {},
        },

        // Refund details
        refund: {
            refunded: { type: Boolean, default: false },
            refundId: { type: String }, // Stripe/Razorpay refund ID
            amount: { type: Number },
            reason: { type: String },
            refundedAt: { type: Date },
        },
    },
    { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ transactionId: 1 });

export default mongoose.model("Payment", paymentSchema);