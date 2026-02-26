"use client";

import { useState, useEffect } from "react";
import { CheckoutTemplateDoc, CheckoutTemplateField } from "@/lib/types/game";
import { checkoutTemplatesApiClient } from "@/services/checkoutTemplates/checkoutTemplatesApi.client";
import Modal from "@/components/ui/Modal";
import StatusToggle from "@/components/form/StatusToggle";
import ModalFooter from "@/components/admin/shared/ModalFooter";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onClose: () => void;
    template: CheckoutTemplateDoc;
    onSaved: (updated: CheckoutTemplateDoc) => void;
}

const TYPE_COLORS: Record<string, string> = {
    text: "bg-blue-50 text-blue-600",
    email: "bg-purple-50 text-purple-600",
    password: "bg-red-50 text-red-600",
    number: "bg-amber-50 text-amber-600",
    dropdown: "bg-green-50 text-green-600",
    tel: "bg-teal-50 text-teal-600",
};

export default function EditTemplateModal({
    open,
    onClose,
    template,
    onSaved,
}: Props) {
    const [fields, setFields] = useState<CheckoutTemplateField[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFields(template.fields.map((f) => ({ ...f })));
    }, [template]);

    const toggleField = (index: number) => {
        setFields((prev) =>
            prev.map((f, i) =>
                i === index ? { ...f, enabled: !f.enabled } : f
            )
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await checkoutTemplatesApiClient.update(template.key, {
                fields,
            });
            toast.success("Template updated");
            onSaved(res.data);
            onClose();
        } catch {
            toast.error("Failed to update template");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {template.label}
            </h2>
            <p className="text-xs text-gray-400 mb-4">
                Toggle fields on or off for the checkout form
            </p>

            <div className="space-y-3">
                {fields.map((field, idx) => (
                    <div
                        key={field.fieldKey}
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                            field.enabled
                                ? "border-gray-200 bg-white"
                                : "border-orange-200 bg-orange-50/50 opacity-60"
                        }`}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                {field.fieldName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                        TYPE_COLORS[field.fieldType] ||
                                        "bg-gray-50 text-gray-500"
                                    }`}
                                >
                                    {field.fieldType}
                                </span>
                                {field.required ? (
                                    <span className="text-[10px] text-red-400">
                                        Required
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-gray-300">
                                        Optional
                                    </span>
                                )}
                            </div>
                        </div>

                        <StatusToggle
                            value={field.enabled ? "active" : "inactive"}
                            onChange={() => toggleField(idx)}
                        />
                    </div>
                ))}
            </div>

            <ModalFooter
                primaryLabel={saving ? "Saving..." : "Save"}
                onPrimary={handleSave}
                onSecondary={onClose}
            />
        </Modal>
    );
}
