"use client";

import { useState, useEffect } from "react";
import { CheckoutTemplateDoc } from "@/lib/types/game";
import { checkoutTemplatesApiClient } from "@/services/checkoutTemplates/checkoutTemplatesApi.client";
import Select from "@/components/form/Select";

interface Props {
    selectedTemplate: string;
    templateOptions: Record<string, any>;
    onTemplateChange: (templateKey: string) => void;
    onOptionsChange: (options: Record<string, any>) => void;
    error?: string;
}

export default function CheckoutTemplateSelector({
    selectedTemplate,
    templateOptions,
    onTemplateChange,
    onOptionsChange,
    error,
}: Props) {
    const [templates, setTemplates] = useState<CheckoutTemplateDoc[]>([]);

    useEffect(() => {
        checkoutTemplatesApiClient
            .getAll()
            .then((res) => setTemplates(res.data))
            .catch(() => {});
    }, []);

    const selectOptions = [
        { value: "", label: "Select a template" },
        ...templates.map((t) => ({ value: t.key, label: t.label })),
    ];

    const template = templates.find((t) => t.key === selectedTemplate);
    const enabledFields = template?.fields.filter((f) => f.enabled) || [];

    return (
        <div className="space-y-4">
            {/* Template Dropdown */}
            <Select
                label="Checkout Template"
                required
                value={selectedTemplate}
                onChange={(e) => onTemplateChange(e.target.value)}
                options={selectOptions}
                error={error}
            />

            {/* Template Preview */}
            {template && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-blue-800">
                        Template Fields Preview — {template.label}
                    </p>
                    <div className="space-y-2">
                        {enabledFields.map((field) => (
                            <div
                                key={field.fieldKey}
                                className="flex items-center gap-3 text-sm"
                            >
                                <span className="text-blue-600 font-medium">
                                    {field.fieldName}
                                </span>
                                <span className="text-blue-400 text-xs">
                                    ({field.fieldType})
                                </span>
                                {field.required ? (
                                    <span className="text-xs text-red-500">
                                        Required
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Optional
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Template-specific options */}
                    {selectedTemplate === "uid_topup" && (
                        <div className="pt-2 border-t border-blue-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={
                                        templateOptions.zoneRequired ?? false
                                    }
                                    onChange={(e) =>
                                        onOptionsChange({
                                            ...templateOptions,
                                            zoneRequired: e.target.checked,
                                        })
                                    }
                                    className="rounded"
                                />
                                <label className="text-sm text-blue-800">
                                    Zone/Server is required
                                </label>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-blue-700 block mb-1">
                                    Zone/Server options (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-2 py-1.5 text-sm border border-blue-200 rounded bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                                    placeholder="e.g. Asia, Europe, America"
                                    value={templateOptions.zoneOptions ?? ""}
                                    onChange={(e) =>
                                        onOptionsChange({
                                            ...templateOptions,
                                            zoneOptions: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
