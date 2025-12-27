"use client";

import { RequiredField } from "@/services/games";
import { RiArrowDownSLine } from "react-icons/ri";

function capitalize(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

interface UserDetailsFormProps {
    fields: RequiredField[];
    value: Record<string, string>;
    onChange: (key: string, value: string) => void;
    errors: Record<string, string>;
}

export default function UserDetailsForm({ fields, value, onChange, errors }: UserDetailsFormProps) {
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-secondary mb-4">Enter Player Details</h3>

            <div className="grid grid-cols-1 gap-5">
                {fields.map((field) => (
                    <div key={field.fieldKey} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-200">
                            {capitalize(field.fieldName)}
                            {field.required && <span className="text-red-400"> *</span>}
                        </label>

                        {(field.fieldType === "text" ||
                            field.fieldType === "email" ||
                            field.fieldType === "number") && (
                                <>
                                    <input
                                        type={field.fieldType}
                                        value={value[field.fieldKey] || ""}
                                        onChange={(e) => onChange(field.fieldKey, e.target.value)}
                                        placeholder={field.placeholder || `Enter ${capitalize(field.fieldName)}`}
                                        className={`px-4 py-2 bg-white/5 border text-white rounded-xl placeholder-gray-400 backdrop-blur-lg focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(255,120,0,0.4)] transition-all
                                        ${errors[field.fieldKey]
                                                ? "border-red-500"
                                                : "border-white/10 focus:border-secondary"}`}
                                    />
                                    {errors[field.fieldKey] && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors[field.fieldKey]}
                                        </p>
                                    )}
                                </>
                            )}

                        {field.fieldType === "dropdown" && (
                            <div className="relative">
                                <select
                                    value={value[field.fieldKey] || ""}
                                    onChange={(e) => onChange(field.fieldKey, e.target.value)}
                                    className={`w-full px-4 py-2 bg-white/5 border text-white rounded-xl placeholder-gray-400 backdrop-blur-lg focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(255,120,0,0.4)] transition-all
                                        ${errors[field.fieldKey]
                                            ? "border-red-500"
                                            : "border-white/10 focus:border-secondary"}`}
                                >
                                    <option className="text-black">
                                        Select {capitalize(field.fieldName)}
                                    </option>
                                    {field.options?.map((opt: string) => (
                                        <option key={opt} className="text-black">
                                            {opt}
                                        </option>
                                    ))}
                                </select>

                                <RiArrowDownSLine className="absolute right-3 top-3 text-white/70 pointer-events-none" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-400 mt-3">Make sure details are correct. Wrong UID / Server may cause delivery delays.</p>
        </div>
    );
}