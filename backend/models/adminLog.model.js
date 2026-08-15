import mongoose from "mongoose";

const adminActivityLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            required: true,
        },

        // What module this action belongs to
        module: {
            type: String,
            required: true,
            enum: [
                "dashboard",
                "users",
                "banners",
                "games",
                "products",
                "blogs",
                "orders",
                "payments",
                "wallet",
                "settings",
                "other",
            ],
            default: "other",
        },

        // Store old and new values for audit trail
        changes: {
            type: Object,
            default: {},
        },

        // Entity the admin modified (Order ID, Product ID, etc.)
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },

        targetModel: {
            type: String, // e.g., "Order", "Product"
        },

        description: {
            type: String,
        },

        // Forensic & Security Fields
        ip: {
            type: String,
        },

        userAgent: {
            type: String,
        },
    },
    { timestamps: true }
);

// Indexing for faster queries
adminActivityLogSchema.index({ admin: 1, createdAt: -1 });
adminActivityLogSchema.index({ module: 1, createdAt: -1 });
adminActivityLogSchema.index({ action: 1, createdAt: -1 });
adminActivityLogSchema.index({ targetId: 1 });

// TTL Index: Automatically delete logs older than 30 days (30 * 24 * 60 * 60 = 2592000 seconds)
//
// NOTE: this collection is NOT the financial audit trail. Wallet entries logged here
// expire with everything else. The permanent record of every balance change is the
// append-only `wallet_transactions` ledger, which carries admin + reason and has no TTL.
const LOG_RETENTION_DAYS = 30;
adminActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: LOG_RETENTION_DAYS * 24 * 60 * 60 });

export default mongoose.model("AdminActivityLog", adminActivityLogSchema);