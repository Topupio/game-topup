"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckoutTemplateDoc, CheckoutTemplateField } from "@/lib/types/game";
import Input from "@/components/form/Input";
import StatusToggle from "@/components/form/StatusToggle";
import ConfirmModal from "@/components/ui/ConfirmModal";

type FieldType = CheckoutTemplateField["fieldType"];

interface FieldTypeMeta {
    label: string;
    value: FieldType;
    icon: string;
    // Tailwind tokens for the accent chip / selected state.
    dot: string; // bg color for the small color dot
    selBg: string; // selected background
    selText: string; // selected text
    selRing: string; // selected ring/border
    chipBg: string; // soft chip background (card accent)
    chipText: string; // chip text
}

const FIELD_TYPES: FieldTypeMeta[] = [
    {
        label: "Text",
        value: "text",
        icon: "Aa",
        dot: "bg-blue-500",
        selBg: "bg-blue-50",
        selText: "text-blue-700",
        selRing: "ring-blue-400 border-blue-400",
        chipBg: "bg-blue-50",
        chipText: "text-blue-700",
    },
    {
        label: "Number",
        value: "number",
        icon: "123",
        dot: "bg-amber-500",
        selBg: "bg-amber-50",
        selText: "text-amber-700",
        selRing: "ring-amber-400 border-amber-400",
        chipBg: "bg-amber-50",
        chipText: "text-amber-700",
    },
    {
        label: "Email",
        value: "email",
        icon: "@",
        dot: "bg-purple-500",
        selBg: "bg-purple-50",
        selText: "text-purple-700",
        selRing: "ring-purple-400 border-purple-400",
        chipBg: "bg-purple-50",
        chipText: "text-purple-700",
    },
    {
        label: "Password",
        value: "password",
        icon: "••",
        dot: "bg-red-500",
        selBg: "bg-red-50",
        selText: "text-red-700",
        selRing: "ring-red-400 border-red-400",
        chipBg: "bg-red-50",
        chipText: "text-red-700",
    },
    {
        label: "Dropdown",
        value: "dropdown",
        icon: "▾",
        dot: "bg-green-500",
        selBg: "bg-green-50",
        selText: "text-green-700",
        selRing: "ring-green-400 border-green-400",
        chipBg: "bg-green-50",
        chipText: "text-green-700",
    },
    {
        label: "Phone",
        value: "tel",
        icon: "☎",
        dot: "bg-teal-500",
        selBg: "bg-teal-50",
        selText: "text-teal-700",
        selRing: "ring-teal-400 border-teal-400",
        chipBg: "bg-teal-50",
        chipText: "text-teal-700",
    },
];

const fieldTypeMeta = (value: FieldType): FieldTypeMeta =>
    FIELD_TYPES.find((t) => t.value === value) ?? FIELD_TYPES[0];

export interface TemplatePayload {
    key: string;
    label: string;
    fields: CheckoutTemplateField[];
    enabled: boolean;
}

interface Props {
    open: boolean;
    mode: "create" | "edit";
    template?: CheckoutTemplateDoc | null;
    saving?: boolean;
    onClose: () => void;
    onSubmit: (payload: TemplatePayload) => void;
}

const slugify = (s: string) =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

// A phone-like field should use the "tel" type so the storefront renders the
// country-code PhoneInput (with country search) instead of a plain text box.
const PHONE_NAME_RE = /\b(phone|ph\.?|mobile|whats\s*app|whatsapp|contact|tel|cell|sms)\b/i;
const looksLikePhone = (name: string) => PHONE_NAME_RE.test(name);

const blankField = (): CheckoutTemplateField => ({
    fieldKey: "",
    fieldName: "",
    fieldType: "text",
    required: false,
    placeholder: "",
    options: [],
    enabled: true,
});

const whatsappField = (): CheckoutTemplateField => ({
    fieldKey: "whatsapp_number",
    fieldName: "WhatsApp Number",
    fieldType: "tel",
    required: true,
    placeholder: "Enter WhatsApp number",
    options: [],
    enabled: true,
});

export default function TemplateForm({
    open,
    mode,
    template,
    saving = false,
    onClose,
    onSubmit,
}: Props) {
    const isEdit = mode === "edit" && !!template;
    const [key, setKey] = useState(isEdit ? template!.key : "");
    const [label, setLabel] = useState(isEdit ? template!.label : "");
    const [enabled, setEnabled] = useState(
        isEdit ? template!.enabled !== false : true
    );
    const [fields, setFields] = useState<CheckoutTemplateField[]>(
        isEdit
            ? template!.fields.map((f) => ({ ...f, options: [...f.options] }))
            : [whatsappField()]
    );
    const [error, setError] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    // Field indices where the admin manually picked a type — we won't auto-coerce these.
    const [typeTouched, setTypeTouched] = useState<Set<number>>(new Set());

    const isBuiltIn = !!template?.isBuiltIn;

    const updateField = (idx: number, patch: Partial<CheckoutTemplateField>) => {
        setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
    };

    // Update a field's name, auto-coercing to "tel" for phone-like names unless
    // the admin has already chosen a type for this field manually.
    const updateFieldName = (idx: number, fieldName: string) => {
        setFields((prev) =>
            prev.map((f, i) => {
                if (i !== idx) return f;
                const next = { ...f, fieldName };
                if (
                    !typeTouched.has(idx) &&
                    f.fieldType !== "dropdown" &&
                    looksLikePhone(fieldName)
                ) {
                    next.fieldType = "tel";
                }
                return next;
            })
        );
    };

    // Mark a field's type as manually chosen so name edits stop auto-coercing it.
    const selectFieldType = (idx: number, fieldType: CheckoutTemplateField["fieldType"]) => {
        setTypeTouched((prev) => new Set(prev).add(idx));
        updateField(idx, { fieldType });
    };

    const removeField = (idx: number) => {
        setFields((prev) => prev.filter((_, i) => i !== idx));
    };

    const addField = () => setFields((prev) => [...prev, blankField()]);

    const updateOption = (fieldIdx: number, optIdx: number, value: string) => {
        setFields((prev) =>
            prev.map((f, i) =>
                i === fieldIdx
                    ? { ...f, options: f.options.map((o, j) => (j === optIdx ? value : o)) }
                    : f
            )
        );
    };

    const addOption = (fieldIdx: number) => {
        setFields((prev) =>
            prev.map((f, i) => (i === fieldIdx ? { ...f, options: [...f.options, ""] } : f))
        );
    };

    const removeOption = (fieldIdx: number, optIdx: number) => {
        setFields((prev) =>
            prev.map((f, i) =>
                i === fieldIdx
                    ? { ...f, options: f.options.filter((_, j) => j !== optIdx) }
                    : f
            )
        );
    };

    const validate = (): string => {
        if (!label.trim()) return "Template label is required";
        if (mode === "create" && !slugify(key || label)) return "Template key is required";
        if (fields.length === 0) return "Add at least one field";
        const keys = new Set<string>();
        for (const f of fields) {
            const fk = slugify(f.fieldKey || f.fieldName);
            if (!fk || !f.fieldName.trim()) return "Each field needs a name";
            if (keys.has(fk)) return `Duplicate field key '${fk}'`;
            keys.add(fk);
            if (f.fieldType === "dropdown") {
                const opts = f.options.map((o) => o.trim()).filter(Boolean);
                if (opts.length === 0)
                    return `Dropdown field '${f.fieldName}' needs at least one option`;
            }
        }
        return "";
    };

    const buildPayload = (): TemplatePayload => ({
        key: mode === "create" ? slugify(key || label) : key,
        label: label.trim(),
        enabled,
        fields: fields.map((f) => ({
            ...f,
            fieldKey: slugify(f.fieldKey || f.fieldName),
            fieldName: f.fieldName.trim(),
            options:
                f.fieldType === "dropdown"
                    ? f.options.map((o) => o.trim()).filter(Boolean)
                    : [],
        })),
    });

    const attemptSubmit = () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setError("");
        // Edit mode: confirm before mutating a live template.
        if (mode === "edit") {
            setConfirmOpen(true);
        } else {
            onSubmit(buildPayload());
        }
    };

    const confirmSubmit = () => {
        setConfirmOpen(false);
        onSubmit(buildPayload());
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/40 z-[60]"
                            onClick={onClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="fixed top-1/2 left-1/2 w-[640px] max-w-[94vw] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-[70] flex flex-col overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 20 }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-100">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                                        {mode === "create"
                                            ? "New Checkout Template"
                                            : `Edit — ${template?.label}`}
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Configure the fields customers fill in at checkout
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <span
                                        className={`text-xs font-medium ${
                                            enabled ? "text-green-600" : "text-gray-400"
                                        }`}
                                    >
                                        {enabled ? "Enabled" : "Disabled"}
                                    </span>
                                    <StatusToggle
                                        value={enabled ? "active" : "inactive"}
                                        onChange={() => setEnabled((v) => !v)}
                                    />
                                </div>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                <div
                                    className={`space-y-5 transition ${
                                        enabled ? "" : "opacity-60"
                                    }`}
                                >
                                    {/* Template meta */}
                                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-4">
                                        <Input
                                            label="Template Label"
                                            required
                                            value={label}
                                            placeholder="e.g. Steam Wallet Top-Up"
                                            onChange={(e) => setLabel(e.target.value)}
                                        />
                                        <Input
                                            label="Template Key"
                                            required={mode === "create"}
                                            value={
                                                mode === "create"
                                                    ? key
                                                    : template?.key || ""
                                            }
                                            placeholder="auto-generated from label"
                                            disabled={mode === "edit"}
                                            helperText={
                                                mode === "edit"
                                                    ? "Key cannot be changed"
                                                    : "lowercase, letters / numbers / underscore"
                                            }
                                            onChange={(e) => setKey(e.target.value)}
                                        />
                                    </div>

                                    {/* Fields */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Fields
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {fields.length}{" "}
                                                    {fields.length === 1
                                                        ? "field"
                                                        : "fields"}{" "}
                                                    on this form
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addField}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                                            >
                                                <span className="text-base leading-none">
                                                    +
                                                </span>
                                                Add field
                                            </button>
                                        </div>

                                        {fields.map((field, idx) => {
                                            const meta = fieldTypeMeta(field.fieldType);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`relative rounded-xl border pl-4 pr-3 py-3 space-y-3 transition ${
                                                        field.enabled
                                                            ? "border-gray-200 bg-white shadow-sm"
                                                            : "border-orange-200 bg-orange-50/50 opacity-60"
                                                    }`}
                                                >
                                                    {/* Accent rail colored by field type */}
                                                    <span
                                                        className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${
                                                            field.enabled
                                                                ? meta.dot
                                                                : "bg-orange-300"
                                                        }`}
                                                        aria-hidden
                                                    />

                                                    {/* Row 1: label + toggle + remove */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1">
                                                            <Input
                                                                value={field.fieldName}
                                                                placeholder="Field label (e.g. Player ID)"
                                                                onChange={(e) =>
                                                                    updateFieldName(
                                                                        idx,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <StatusToggle
                                                                value={
                                                                    field.enabled
                                                                        ? "active"
                                                                        : "inactive"
                                                                }
                                                                onChange={() =>
                                                                    updateField(idx, {
                                                                        enabled:
                                                                            !field.enabled,
                                                                    })
                                                                }
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeField(idx)
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                                aria-label="Remove field"
                                                                title="Remove field"
                                                            >
                                                                <span className="text-lg leading-none">
                                                                    ×
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Prominent field-type picker */}
                                                    <div>
                                                        <p className="mb-1.5 text-xs font-semibold text-gray-600">
                                                            Field type
                                                        </p>
                                                        <div
                                                            role="radiogroup"
                                                            aria-label="Field type"
                                                            className="flex flex-wrap gap-1.5"
                                                        >
                                                            {FIELD_TYPES.map((t) => {
                                                                const active =
                                                                    field.fieldType ===
                                                                    t.value;
                                                                return (
                                                                    <button
                                                                        key={t.value}
                                                                        type="button"
                                                                        role="radio"
                                                                        aria-checked={
                                                                            active
                                                                        }
                                                                        onClick={() =>
                                                                            selectFieldType(
                                                                                idx,
                                                                                t.value
                                                                            )
                                                                        }
                                                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                                                                            active
                                                                                ? `${t.selBg} ${t.selText} ring-2 ${t.selRing}`
                                                                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                                                        }`}
                                                                    >
                                                                        <span
                                                                            className={`flex h-4 min-w-[1rem] items-center justify-center rounded text-[10px] font-bold leading-none ${
                                                                                active
                                                                                    ? "bg-white/70"
                                                                                    : "text-gray-400"
                                                                            }`}
                                                                            aria-hidden
                                                                        >
                                                                            {t.icon}
                                                                        </span>
                                                                        {t.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {looksLikePhone(
                                                            field.fieldName
                                                        ) &&
                                                            field.fieldType !==
                                                                "tel" && (
                                                                <p className="mt-1.5 text-[11px] text-teal-600">
                                                                    Looks like a phone
                                                                    field — pick{" "}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            selectFieldType(
                                                                                idx,
                                                                                "tel"
                                                                            )
                                                                        }
                                                                        className="font-semibold underline underline-offset-2 hover:text-teal-700"
                                                                    >
                                                                        Phone
                                                                    </button>{" "}
                                                                    so customers get the
                                                                    country-code picker.
                                                                </p>
                                                            )}
                                                    </div>

                                                    {/* Placeholder + required */}
                                                    <div className="flex items-end gap-3">
                                                        <div className="flex-1">
                                                            <Input
                                                                label="Placeholder"
                                                                value={field.placeholder}
                                                                placeholder="Shown inside the empty field (optional)"
                                                                onChange={(e) =>
                                                                    updateField(idx, {
                                                                        placeholder:
                                                                            e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                        <label className="flex h-[42px] cursor-pointer select-none items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:border-gray-300">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) =>
                                                                    updateField(idx, {
                                                                        required:
                                                                            e.target
                                                                                .checked,
                                                                    })
                                                                }
                                                                className="h-4 w-4 rounded accent-blue-600"
                                                            />
                                                            Required
                                                        </label>
                                                    </div>

                                                    {/* Dropdown options editor */}
                                                    {field.fieldType === "dropdown" && (
                                                        <div
                                                            className={`space-y-2 rounded-lg border p-3 ${meta.chipBg} border-green-200/70`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <p
                                                                    className={`text-xs font-semibold ${meta.chipText}`}
                                                                >
                                                                    Dropdown options
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        addOption(idx)
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]"
                                                                >
                                                                    <span className="leading-none">
                                                                        +
                                                                    </span>
                                                                    Add option
                                                                </button>
                                                            </div>
                                                            {field.options.map(
                                                                (opt, optIdx) => (
                                                                    <div
                                                                        key={optIdx}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-green-700">
                                                                            {optIdx + 1}
                                                                        </span>
                                                                        <input
                                                                            value={opt}
                                                                            placeholder={`Option ${
                                                                                optIdx + 1
                                                                            }`}
                                                                            onChange={(e) =>
                                                                                updateOption(
                                                                                    idx,
                                                                                    optIdx,
                                                                                    e.target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className="flex-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeOption(
                                                                                    idx,
                                                                                    optIdx
                                                                                )
                                                                            }
                                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                                            aria-label="Remove option"
                                                                        >
                                                                            <span className="text-lg leading-none">
                                                                                ×
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                            {field.options.length === 0 && (
                                                                <p className="text-[11px] text-green-700/70">
                                                                    No options yet — add at
                                                                    least one.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {fields.length === 0 && (
                                            <button
                                                type="button"
                                                onClick={addField}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-6 text-sm font-medium text-gray-400 transition hover:border-blue-300 hover:text-blue-500"
                                            >
                                                <span className="text-lg leading-none">
                                                    +
                                                </span>
                                                Add your first field
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Sticky footer */}
                            <div className="flex gap-2 border-t border-gray-100 bg-white px-6 py-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={attemptSubmit}
                                    disabled={saving}
                                    className="flex-[1.5] rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : mode === "create"
                                        ? "Create template"
                                        : "Save changes"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmModal
                open={confirmOpen}
                title="Save changes?"
                message={
                    isBuiltIn
                        ? "This is a live built-in template. Changes immediately affect the customer checkout form."
                        : "Changes will immediately affect the customer checkout form for games using this template."
                }
                confirmLabel="Save changes"
                onConfirm={confirmSubmit}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
