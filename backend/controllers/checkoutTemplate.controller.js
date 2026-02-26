import CheckoutTemplate from "../models/checkoutTemplate.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { logAdminActivity } from "../utils/adminLogger.js";

/**
 * @desc    Get all checkout templates
 * @route   GET /api/checkout-templates
 * @access  Public
 */
export const getAllTemplates = asyncHandler(async (req, res) => {
    const templates = await CheckoutTemplate.find({}).sort({ key: 1 }).lean();
    res.status(200).json({ success: true, data: templates });
});

/**
 * @desc    Get a single checkout template by key
 * @route   GET /api/checkout-templates/:key
 * @access  Public
 */
export const getTemplate = asyncHandler(async (req, res) => {
    const template = await CheckoutTemplate.findOne({ key: req.params.key }).lean();
    if (!template) {
        return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.status(200).json({ success: true, data: template });
});

/**
 * @desc    Update a checkout template
 * @route   PUT /api/checkout-templates/:key
 * @access  Admin
 */
export const updateTemplate = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { label, fields } = req.body;

    const template = await CheckoutTemplate.findOne({ key });
    if (!template) {
        return res.status(404).json({ success: false, message: "Template not found" });
    }

    if (label !== undefined) template.label = label;

    if (fields !== undefined) {
        if (!Array.isArray(fields)) {
            return res.status(400).json({ success: false, message: "fields must be an array" });
        }

        const validTypes = ["text", "number", "email", "password", "dropdown", "tel"];
        for (const f of fields) {
            if (!f.fieldKey || !f.fieldName) {
                return res.status(400).json({
                    success: false,
                    message: "Each field must have fieldKey and fieldName",
                });
            }
            if (f.fieldType && !validTypes.includes(f.fieldType)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid fieldType '${f.fieldType}'`,
                });
            }
        }

        template.fields = fields.map((f) => ({
            fieldKey: f.fieldKey,
            fieldName: f.fieldName,
            fieldType: f.fieldType || "text",
            required: f.required ?? false,
            placeholder: f.placeholder || "",
            options: f.options || [],
            enabled: f.enabled ?? true,
        }));
    }

    await template.save();

    await logAdminActivity({
        req,
        action: "UPDATE",
        module: "checkout-templates",
        description: `Updated checkout template '${key}'`,
    });

    res.status(200).json({ success: true, data: template });
});
