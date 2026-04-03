import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
    {
        upi: {
            enabled: {
                type: Boolean,
                default: false,
            },
            upiId: {
                type: String,
                trim: true,
                default: "",
            },
            payeeName: {
                type: String,
                trim: true,
                default: "Game Topup",
            },
            instructions: {
                type: String,
                trim: true,
                default: "",
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model("PaymentSettings", paymentSettingsSchema);
