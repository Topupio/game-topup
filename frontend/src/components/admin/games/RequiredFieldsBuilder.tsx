"use client";

import { RequiredField } from "@/lib/types/game";
import { IoTrash } from "react-icons/io5";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";

interface Props {
    fields: RequiredField[];
    onChange: (fields: RequiredField[]) => void;
    errors?: { fieldName?: string; fieldKey?: string; options?: string }[];
}

export default function RequiredFieldsBuilder({ fields, onChange, errors }: Props) {

    const addField = () => {
        onChange([
            ...fields,
            {
                fieldName: "",
                fieldKey: "",
                fieldType: "text",
                placeholder: "",
                options: [],
                required: true,
            },
        ]);
    };

    const updateField = (index: number, value: Partial<RequiredField>) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], ...value };
        onChange(updated);
    };

    const removeField = (index: number) => {
        onChange(fields.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <label className="text-lg font-semibold mr-2">Required Fields</label>

            {fields?.map((field, i) => (
                <div key={i} className="p-4 border rounded-xl bg-gray-50">
                    {/* Row 1: Field Name + Field Key */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <Input
                            label="Field Name"
                            placeholder="Full Name"
                            required
                            value={field.fieldName}
                            error={errors?.[i]?.fieldName}
                            onChange={(e) => {
                                const fieldName = e.target.value;
                                const fieldKey =
                                    fieldName
                                        .toLowerCase()
                                        .replace(/\s+/g, "_")
                                        .replace(/[^a-z0-9_]/g, "");
                                updateField(i, { fieldName, fieldKey });
                            }}
                        />

                        <Input
                            label="Field Key"
                            placeholder="full_name"
                            value={field.fieldKey}
                            error={errors?.[i]?.fieldKey}
                            onChange={(e) =>
                                updateField(i, { fieldKey: e.target.value })
                            }
                        />
                    </div>

                    {/* Row 2: Field Type + Placeholder */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <Select
                            label="Field Type"
                            required
                            value={field.fieldType}
                            onChange={(e) => {
                                const newType = e.target.value;
                                updateField(i, {
                                    fieldType: newType,
                                    options: newType === "dropdown" ? field.options : [],
                                });
                            }}
                            options={[
                                { label: "Text", value: "text" },
                                { label: "Number", value: "number" },
                                { label: "Email", value: "email" },
                                { label: "Dropdown", value: "dropdown" },
                            ]}
                        />

                        <Input
                            label="Placeholder"
                            placeholder="Enter text..."
                            value={field.placeholder}
                            onChange={(e) =>
                                updateField(i, { placeholder: e.target.value })
                            }
                        />
                    </div>

                    {/* Dropdown Options */}
                    {field.fieldType === "dropdown" && (
                        <div className="mb-3">
                            <label className="font-medium">Options (comma-separated)</label>
                            <textarea
                                className="border p-2 rounded w-full"
                                rows={2}
                                placeholder="e.g. Option A, Option B"
                                value={field.options?.join(", ")}
                                onChange={(e) =>
                                    updateField(i, {
                                        options: e.target.value
                                            .split(",")
                                            .map((o) => o.trim())
                                            .filter(Boolean),
                                    })
                                }
                            />
                            {errors?.[i]?.options && (
                                <p className="text-red-500 text-sm">{errors[i].options}</p>
                            )}
                        </div>
                    )}

                    {/* Required Toggle */}
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                                updateField(i, { required: e.target.checked })
                            }
                        />
                        <label>Required</label>
                    </div>

                    {/* Remove Button */}
                    <button
                        type="button"
                        className="text-red-600 flex items-center gap-1 cursor-pointer"
                        onClick={() => removeField(i)}
                    >
                        <IoTrash /> Remove Field
                    </button>
                </div>
            ))}

            <button
                onClick={addField}
                type="button"
                className="text-green-600 hover:text-green-700 cursor-pointer"
            >
                + Add Field
            </button>
        </div>
    );
}
