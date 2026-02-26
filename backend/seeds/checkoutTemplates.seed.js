import CheckoutTemplate from "../models/checkoutTemplate.model.js";
import { CHECKOUT_TEMPLATES } from "../constants/checkoutTemplates.js";

export async function seedCheckoutTemplates() {
    // Remove duplicates if any exist (keep the oldest per key)
    const duplicates = await CheckoutTemplate.aggregate([
        { $group: { _id: "$key", ids: { $push: "$_id" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
    ]);
    for (const dup of duplicates) {
        const [, ...extras] = dup.ids;
        await CheckoutTemplate.deleteMany({ _id: { $in: extras } });
    }

    // Ensure all templates have a whatsapp_number field
    const allTemplates = await CheckoutTemplate.find({});
    for (const tmpl of allTemplates) {
        const hasWhatsApp = tmpl.fields.some((f) => f.fieldKey === "whatsapp_number");
        if (!hasWhatsApp) {
            tmpl.fields.unshift({
                fieldKey: "whatsapp_number",
                fieldName: "WhatsApp Number",
                fieldType: "tel",
                required: true,
                placeholder: "Enter WhatsApp number",
                options: [],
                enabled: true,
            });
            await tmpl.save();
        }
    }

    const count = await CheckoutTemplate.countDocuments();
    if (count > 0) return;

    const ops = Object.values(CHECKOUT_TEMPLATES).map((t) => ({
        updateOne: {
            filter: { key: t.key },
            update: {
                $setOnInsert: {
                    key: t.key,
                    label: t.label,
                    fields: t.fields.map((f) => ({
                        fieldKey: f.fieldKey,
                        fieldName: f.fieldName,
                        fieldType: f.fieldType,
                        required: f.required,
                        placeholder: f.placeholder,
                        options: f.options || [],
                        enabled: true,
                    })),
                },
            },
            upsert: true,
        },
    }));

    await CheckoutTemplate.bulkWrite(ops);
    console.log("Seeded checkout templates");
}
