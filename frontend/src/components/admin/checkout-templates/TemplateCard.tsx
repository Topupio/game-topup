"use client";

import { CheckoutTemplate } from "@/lib/constants/checkoutTemplates";
import { TbPencil } from "react-icons/tb";
import { toast } from "react-toastify";

interface Props {
    template: CheckoutTemplate;
}

const TYPE_COLORS: Record<string, string> = {
    text: "bg-blue-50 text-blue-600",
    email: "bg-purple-50 text-purple-600",
    password: "bg-red-50 text-red-600",
    number: "bg-amber-50 text-amber-600",
    dropdown: "bg-green-50 text-green-600",
};

export default function TemplateCard({ template }: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900">
                    {template.label}
                </h3>
                <span className="text-[11px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded shrink-0">
                    {template.key}
                </span>
            </div>

            <p className="text-xs text-gray-400 mb-3">
                {template.fields.length} field{template.fields.length !== 1 ? "s" : ""}
            </p>

            {/* Fields list */}
            <div className="border-t border-gray-100 pt-3 space-y-2 flex-1">
                {template.fields.map((field) => (
                    <div
                        key={field.fieldKey}
                        className="flex items-center justify-between gap-2 text-sm"
                    >
                        <span className="text-gray-700 truncate">
                            {field.fieldName}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    TYPE_COLORS[field.fieldType] || "bg-gray-50 text-gray-500"
                                }`}
                            >
                                {field.fieldType}
                            </span>
                            {field.required ? (
                                <span className="text-[10px] font-medium text-red-400">
                                    Required
                                </span>
                            ) : (
                                <span className="text-[10px] text-gray-300">
                                    Optional
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-3 mt-3 flex justify-end">
                <button
                    onClick={() => toast.info("Edit template — coming soon")}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
                >
                    <TbPencil size={15} /> Edit
                </button>
            </div>
        </div>
    );
}
