import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
    {
        fieldKey: {
            type: String,
            required: true,
            trim: true,
        },
        fieldName: {
            type: String,
            required: true,
            trim: true,
        },
        fieldType: {
            type: String,
            enum: ["text", "number", "email", "password", "dropdown", "tel"],
            default: "text",
        },
        required: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: "",
        },
        options: {
            type: [String],
            default: [],
        },
        enabled: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

const checkoutTemplateSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        fields: {
            type: [fieldSchema],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model("CheckoutTemplate", checkoutTemplateSchema);
