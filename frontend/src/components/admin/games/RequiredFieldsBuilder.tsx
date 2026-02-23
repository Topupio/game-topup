"use client";

import { RequiredField } from "@/lib/types/game";
import { TbPlus, TbTrash } from "react-icons/tb";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";

interface Props {
    fields: RequiredField[];
    onChange: (fields: RequiredField[]) => void;
    errors?: { fieldName?: string; fieldKey?: string; options?: string }[];
}

export default function RequiredFieldsBuilder({
    fields,
    onChange,
    errors,
}: Props) {
    const addField = () => {
        onChange([
            ...fields,
            {
                fieldName: "",
                fieldKey: "",
                fieldType: "text",
                placeholder: "",
                options: [],
                optionsText: "",
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
            {/* Add Button */}
            <div className="flex justify-between items-center mb-4">
                <button
                    type="button"
                    onClick={addField}
                    className="flex items-center gap-1 text-sm bg-muted hover:bg-muted text-foreground px-3 py-1.5 rounded transition"
                >
                    <TbPlus /> Add Field
                </button>
            </div>

            {/* Fields */}
            <div className="space-y-4">
                {fields.map((field, i) => (
                    <div
                        key={i}
                        className="bg-muted p-4 rounded-lg border border-border relative group"
                    >
                        {/* Delete */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                            <button
                                type="button"
                                onClick={() => removeField(i)}
                                className="p-1.5 text-red-500 hover:bg-card rounded"
                            >
                                <TbTrash />
                            </button>
                        </div>

                        <div className="space-y-3 pr-10">
                            {/* Row 1 */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Field Name"
                                    placeholder="Full Name"
                                    required
                                    value={field.fieldName}
                                    error={errors?.[i]?.fieldName}
                                    onChange={(e) => {
                                        const fieldName = e.target.value;
                                        const fieldKey = fieldName
                                            .toLowerCase()
                                            .replace(/\s+/g, "_")
                                            .replace(/[^a-z0-9_]/g, "");
                                        updateField(i, {
                                            fieldName,
                                            fieldKey,
                                        });
                                    }}
                                />

                                <Input
                                    label="Field Key"
                                    placeholder="full_name"
                                    value={field.fieldKey}
                                    error={errors?.[i]?.fieldKey}
                                    onChange={(e) =>
                                        updateField(i, {
                                            fieldKey: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Field Type"
                                    required
                                    value={field.fieldType}
                                    onChange={(e) => {
                                        const newType = e.target.value;
                                        updateField(i, {
                                            fieldType: newType,
                                            options:
                                                newType === "dropdown"
                                                    ? []
                                                    : [],
                                            optionsText: "",
                                        });
                                    }}
                                    options={[
                                        { label: "Text", value: "text" },
                                        { label: "Number", value: "number" },
                                        { label: "Email", value: "email" },
                                        {
                                            label: "Dropdown",
                                            value: "dropdown",
                                        },
                                    ]}
                                />

                                <Input
                                    label="Placeholder"
                                    placeholder="Enter text..."
                                    value={field.placeholder}
                                    onChange={(e) =>
                                        updateField(i, {
                                            placeholder: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Dropdown Options */}
                            {field.fieldType === "dropdown" && (
                                <div>
                                    <label className="block font-medium text-sm mb-1.5">
                                        Options (comma-separated)
                                    </label>
                                    <textarea
                                        className="border border-border p-2 rounded w-full text-sm focus:outline-none focus:border-blue-500"
                                        rows={2}
                                        placeholder="e.g. Option A, Option B"
                                        value={field.optionsText ?? ""}
                                        onChange={(e) => {
                                            const text = e.target.value;
                                            updateField(i, {
                                                optionsText: text,
                                                options: text
                                                    .split(",")
                                                    .map((o) => o.trim())
                                                    .filter(Boolean),
                                            });
                                        }}
                                    />
                                    {errors?.[i]?.options && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors[i].options}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Required */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) =>
                                        updateField(i, {
                                            required: e.target.checked,
                                        })
                                    }
                                    className="rounded"
                                />
                                <label className="text-sm font-medium">
                                    Required Field
                                </label>
                            </div>
                        </div>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-6 bg-muted rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                        No fields yet. Click "Add Field" to add one.
                    </div>
                )}
            </div>
        </div>
    );
}
