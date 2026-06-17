"use client";

import { Delivery, DeliveryItem, DeliveryKind } from "@/services/orders/types";
import {
    deliveryKindForTemplate,
    emptyDelivery,
} from "@/lib/constants/deliveryTemplates";
import Input from "@/components/form/Input";
import Textarea from "@/components/form/TextArea";
import {
    RiAddLine,
    RiDeleteBin6Line,
    RiKey2Line,
    RiCoupon3Line,
    RiCloseLine,
} from "react-icons/ri";

interface Props {
    value: Delivery | null | undefined;
    templateKey?: string;
    disabled?: boolean;
    onChange: (delivery: Delivery | null) => void;
}

const KIND_LABEL: Record<DeliveryKind, string> = {
    credentials: "Account credentials",
    code: "Redeem code",
};

function toDateInputValue(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
}

export default function DeliveryEditor({
    value,
    templateKey,
    disabled,
    onChange,
}: Props) {
    const suggestedKind = deliveryKindForTemplate(templateKey);

    // Nothing to deliver structurally for this template, and none set yet.
    if (!value && !suggestedKind) return null;

    // Helper to patch the current delivery object immutably.
    const patch = (partial: Partial<Delivery>) => {
        if (!value) return;
        onChange({ ...value, ...partial });
    };

    if (!value) {
        const kind = suggestedKind as DeliveryKind;
        return (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            {kind === "credentials" ? <RiKey2Line /> : <RiCoupon3Line />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Add delivery — {KIND_LABEL[kind]}
                            </p>
                            <p className="text-xs text-gray-500">
                                Build the structured delivery card the customer sees on their order.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(emptyDelivery(kind))}
                        className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        Add delivery details
                    </button>
                </div>
            </div>
        );
    }

    const items = value.items ?? [];
    const steps = value.steps ?? [];

    const updateItem = (index: number, partial: Partial<DeliveryItem>) => {
        const next = items.map((it, i) => (i === index ? { ...it, ...partial } : it));
        patch({ items: next });
    };
    const addItem = () =>
        patch({ items: [...items, { label: "", value: "", secret: false }] });
    const removeItem = (index: number) =>
        patch({ items: items.filter((_, i) => i !== index) });

    const updateStep = (index: number, text: string) =>
        patch({ steps: steps.map((s, i) => (i === index ? text : s)) });
    const addStep = () => patch({ steps: [...steps, ""] });
    const removeStep = (index: number) =>
        patch({ steps: steps.filter((_, i) => i !== index) });

    return (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        {value.kind === "credentials" ? <RiKey2Line /> : <RiCoupon3Line />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            Delivery — {KIND_LABEL[value.kind]}
                        </p>
                        <p className="text-[11px] text-gray-500">
                            Shown to the customer as their delivery card.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(null)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                >
                    <RiCloseLine /> Remove delivery
                </button>
            </div>

            {/* Intro */}
            <Textarea
                label="Intro message"
                value={value.intro ?? ""}
                disabled={disabled}
                onChange={(e) => patch({ intro: e.target.value })}
                placeholder="e.g. Your Netflix Premium (4K HDR) — 1 Month plan is ready."
                className="min-h-[70px]"
            />

            {/* Credentials rows */}
            {value.kind === "credentials" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Credential fields
                        </p>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={addItem}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                            <RiAddLine /> Add field
                        </button>
                    </div>
                    {items.length === 0 && (
                        <p className="text-xs text-gray-400">No fields yet — add at least one.</p>
                    )}
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:grid-cols-[1fr_1.4fr_auto]"
                        >
                            <Input
                                value={item.label}
                                disabled={disabled}
                                onChange={(e) => updateItem(i, { label: e.target.value })}
                                placeholder="Label (e.g. Password)"
                            />
                            <Input
                                value={item.value}
                                disabled={disabled}
                                onChange={(e) => updateItem(i, { value: e.target.value })}
                                placeholder="Value"
                            />
                            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={!!item.secret}
                                        disabled={disabled}
                                        onChange={(e) => updateItem(i, { secret: e.target.checked })}
                                        className="rounded"
                                    />
                                    Secret
                                </label>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => removeItem(i)}
                                    className="text-gray-400 transition hover:text-red-500 disabled:opacity-50"
                                    aria-label="Remove field"
                                >
                                    <RiDeleteBin6Line />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Redeem code */}
            {value.kind === "code" && (
                <Input
                    label="Redeem code"
                    value={value.code ?? ""}
                    disabled={disabled}
                    onChange={(e) => patch({ code: e.target.value })}
                    placeholder="e.g. 4XKP-9R2M-WQ7H-T3NB"
                    className="font-mono tracking-wider"
                />
            )}

            {/* Steps */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        How-to steps
                    </p>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={addStep}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                        <RiAddLine /> Add step
                    </button>
                </div>
                {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
                            {i + 1}
                        </span>
                        <Input
                            value={step}
                            disabled={disabled}
                            onChange={(e) => updateStep(i, e.target.value)}
                            placeholder={`Step ${i + 1}`}
                        />
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => removeStep(i)}
                            className="text-gray-400 transition hover:text-red-500 disabled:opacity-50"
                            aria-label="Remove step"
                        >
                            <RiDeleteBin6Line />
                        </button>
                    </div>
                ))}
            </div>

            {/* Notice + validity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Textarea
                    label="Notice / warning"
                    value={value.notice ?? ""}
                    disabled={disabled}
                    onChange={(e) => patch({ notice: e.target.value })}
                    placeholder="e.g. Don't change the account email or password — it can interrupt access."
                    className="min-h-[70px]"
                />
                {value.kind === "credentials" && (
                    <Input
                        label="Valid until"
                        type="date"
                        value={toDateInputValue(value.validUntil)}
                        disabled={disabled}
                        onChange={(e) =>
                            patch({
                                validUntil: e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : undefined,
                            })
                        }
                    />
                )}
            </div>
        </div>
    );
}
