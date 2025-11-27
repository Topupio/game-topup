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
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <Input
                            label="Field Name"
                            placeholder="Field Name"
                            value={field.fieldName}
                            error={errors?.[i]?.fieldName}
                            onChange={(e) =>
                                updateField(i, { fieldName: e.target.value })
                            }
                        />

                        <Input
                            label="Field Key"
                            placeholder="field_key"
                            value={field.fieldKey}
                            error={errors?.[i]?.fieldKey}
                            onChange={(e) =>
                                updateField(i, { fieldKey: e.target.value })
                            }
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <Select
                            label="Game Category"
                            required
                            options={[
                                { label: "Sports", value: "sports" },
                                { label: "Action", value: "action" },
                                { label: "RPG", value: "rpg" },
                            ]}
                        />

                        <Input
                            label="Placeholder"
                            placeholder="Placeholder"
                            value={field.placeholder}
                            onChange={(e) =>
                                updateField(i, { placeholder: e.target.value })
                            }
                        />
                    </div>

                    {/* Dropdown options */}
                    {field.fieldType === "dropdown" && (
                        <textarea
                            className="border p-2 rounded w-full mb-3"
                            rows={2}
                            placeholder="Enter options separated by commas"
                            value={field.options?.join(", ") ?? ""}
                            onChange={(e) =>
                                updateField(i, {
                                    options: e.target.value.split(",").map((o) => o.trim()),
                                })
                            }
                        />
                    )}

                    <button
                        type="button"
                        className="text-red-600 flex items-center gap-1 cursor-pointer"
                        onClick={() => removeField(i)}
                    >
                        <IoTrash /> Remove
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