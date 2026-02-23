import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema(
    {
        baseCurrency: {
            type: String,
            default: "USD",
            immutable: true,
        },
        targetCurrency: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        rate: {
            type: Number,
            required: true,
            min: 0,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("ExchangeRate", exchangeRateSchema);
