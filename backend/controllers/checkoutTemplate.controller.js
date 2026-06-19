import CheckoutTemplate from "../models/checkoutTemplate.model.js";
import Game from "../models/game.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { logAdminActivity } from "../utils/adminLogger.js";

const VALID_FIELD_TYPES = ["text", "number", "email", "password", "dropdown", "tel"];

/**
 * Validate and normalize a fields array. Returns { error } on failure or
 * { fields } with the mapped schema-shaped fields on success.
 */
function validateFields(fields) {
    if (!Array.isArray(fields)) {
        return { error: "fields must be an array" };
    }

    for (const f of fields) {
        if (!f.fieldKey || !f.fieldName) {
            return { error: "Each field must have fieldKey and fieldName" };
        }
        if (f.fieldType && !VALID_FIELD_TYPES.includes(f.fieldType)) {
            return { error: `Invalid fieldType '${f.fieldType}'` };
        }
    }

    const mapped = fields.map((f) => ({
        fieldKey: f.fieldKey,
        fieldName: f.fieldName,
        fieldType: f.fieldType || "text",
        required: f.required ?? false,
        placeholder: f.placeholder || "",
        options: f.options || [],
        enabled: f.enabled ?? true,
    }));

    return { fields: mapped };
}

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
 * @desc    Create a custom checkout template
 * @route   POST /api/checkout-templates
 * @access  Admin
 */
export const createTemplate = asyncHandler(async (req, res) => {
    const { key, label, fields, enabled } = req.body;

    const normalizedKey = (key || "").trim().toLowerCase();
    if (!normalizedKey || !/^[a-z0-9_]+$/.test(normalizedKey)) {
        return res.status(400).json({
            success: false,
            message: "key is required and may only contain lowercase letters, numbers and underscores",
        });
    }
    if (!label || !label.trim()) {
        return res.status(400).json({ success: false, message: "label is required" });
    }

    const exists = await CheckoutTemplate.exists({ key: normalizedKey });
    if (exists) {
        return res.status(409).json({ success: false, message: `Template '${normalizedKey}' already exists` });
    }

    const { error, fields: mappedFields } = validateFields(fields ?? []);
    if (error) {
        return res.status(400).json({ success: false, message: error });
    }

    const template = await CheckoutTemplate.create({
        key: normalizedKey,
        label: label.trim(),
        fields: mappedFields,
        enabled: enabled ?? true,
        isBuiltIn: false,
    });

    await logAdminActivity({
        req,
        action: "CREATE",
        module: "checkout-templates",
        description: `Created checkout template '${normalizedKey}'`,
    });

    res.status(201).json({ success: true, data: template });
});

/**
 * @desc    Update a checkout template
 * @route   PUT /api/checkout-templates/:key
 * @access  Admin
 */
export const updateTemplate = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { label, fields, enabled } = req.body;

    const template = await CheckoutTemplate.findOne({ key });
    if (!template) {
        return res.status(404).json({ success: false, message: "Template not found" });
    }

    if (label !== undefined) template.label = label;
    if (enabled !== undefined) template.enabled = enabled;

    if (fields !== undefined) {
        const { error, fields: mappedFields } = validateFields(fields);
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }
        template.fields = mappedFields;
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

/**
 * @desc    Delete a custom checkout template
 * @route   DELETE /api/checkout-templates/:key
 * @access  Admin
 */
export const deleteTemplate = asyncHandler(async (req, res) => {
    const { key } = req.params;

    const template = await CheckoutTemplate.findOne({ key });
    if (!template) {
        return res.status(404).json({ success: false, message: "Template not found" });
    }
    if (template.isBuiltIn) {
        return res.status(403).json({ success: false, message: "Built-in templates cannot be deleted" });
    }

    const inUse = await Game.countDocuments({ checkoutTemplate: key });
    if (inUse > 0) {
        return res.status(409).json({
            success: false,
            message: `Template is assigned to ${inUse} game(s) and cannot be deleted`,
        });
    }

    await template.deleteOne();

    await logAdminActivity({
        req,
        action: "DELETE",
        module: "checkout-templates",
        description: `Deleted checkout template '${key}'`,
    });

    res.status(200).json({ success: true, message: "Template deleted" });
});
