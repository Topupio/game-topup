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
            enum: ["razorpay", "stripe", "wallet", "binancePay", "paypal", "nowpayments", "upi"],
            default: "paypal",
        },

        currency: {
            type: String,
            default: "USD",
        },

        paymentInfo: {
            transactionId: { type: String, index: true },
            utrNumber: { type: String, trim: true, default: null },
            utrSubmittedAt: { type: Date, default: null },
            paymentGatewayResponse: { type: mongoose.Schema.Types.Mixed }, // optional raw response
        },

        paymentBreakdown: {
            paypal: {
                subtotalAmount: Number,
                subtotalCurrency: String,
                subtotalUsd: Number,
                processingFeeUsd: Number,
                totalUsd: Number,
                processingRate: Number,
                minOrderUsd: Number,
            },
        },

        // External fulfillment tracking (e.g., Gamers Workshop API)
        externalOrder: {
            provider: { type: String },
            externalOrderId: { type: String },
            externalStatus: { type: String },
            placedAt: { type: Date },
            lastCheckedAt: { type: Date },
            rawResponse: { type: mongoose.Schema.Types.Mixed },
        },

        // Required fields collected from UI (like email, playerId, server)
        //
        // `label` is the human-readable name shown at checkout and is rewritten at
        // runtime for some templates ("Zone ID" vs "Server"), so it cannot be relied on
        // to identify a field later. `fieldKey` is the stable identifier from the
        // checkout template, which "Buy again" uses to prefill a new order. It is
        // optional because orders placed before this existed do not have it.
        userInputs: {
            type: [
                {
                    label: { type: String, required: true, trim: true },
                    fieldKey: { type: String, trim: true, default: null },
                    value: { type: mongoose.Schema.Types.Mixed, required: true }
                }
            ],
            default: []
        },

        // Admin workflow
        // "refunded" is appended, never reordered — the frontend maps these by value.
        // It marks a FULLY refunded order; partial refunds leave the status alone and
        // are visible in the `refund` sub-document below.
        orderStatus: {
            type: String,
            enum: ["pending", "paid", "processing", "completed", "cancelled", "failed", "expired", "refunded"],
            default: "pending",
        },

        /**
         * Money returned to the customer's wallet.
         *
         * Refunds are additive: each one appends an entry rather than overwriting, so
         * an order can be partially refunded more than once and the history survives.
         * Amounts are in INR paise, matching the wallet ledger exactly — a refund
         * credits back what was actually charged rather than a fresh conversion.
         */
        refund: {
            totalRefundedPaise: { type: Number, default: 0, min: 0 },
            isFullyRefunded: { type: Boolean, default: false },
            entries: {
                type: [
                    {
                        amountPaise: { type: Number, required: true, min: 1 },
                        destination: { type: String, enum: ["wallet"], default: "wallet" },
                        walletTransaction: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "WalletTransaction",
                            required: true,
                        },
                        reason: { type: String, required: true, trim: true, maxlength: 500 },
                        admin: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "User",
                            required: true,
                        },
                        at: { type: Date, default: Date.now },
                    },
                ],
                default: [],
            },
        },

        adminNote: {
            type: String,
        },

        adminNoteUpdatedAt: {
            type: Date,
        },

        adminNoteReadAt: {
            type: Date,
        },

        adminNoteClearedAt: {
            type: Date,
        },

        completionProof: {
            type: String, // screenshot URL or attachment
        },

        // Structured customer-facing delivery (credentials / redeem code)
        delivery: {
            kind: { type: String, enum: ["credentials", "code"] }, // undefined = none
            intro: { type: String, trim: true },
            items: {
                type: [
                    {
                        label: { type: String, required: true, trim: true },
                        value: { type: String, required: true },
                        secret: { type: Boolean, default: false }, // mask + reveal in UI
                    }
                ],
                default: []
            },
            code: { type: String, trim: true },
            steps: { type: [String], default: [] },
            notice: { type: String, trim: true },
            validUntil: { type: Date },
            deliveredAt: { type: Date },
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
orderSchema.index({ "externalOrder.externalOrderId": 1 });
orderSchema.index({ orderId: 1 });

export default mongoose.model("Order", orderSchema);
