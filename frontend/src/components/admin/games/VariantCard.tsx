"use client";

import { useState } from "react";
import { Variant } from "@/lib/types/game";
import { TbTrash, TbChevronDown, TbChevronUp } from "react-icons/tb";
import Input from "@/components/form/Input";
import StatusToggle from "@/components/form/StatusToggle";
import ImageUploader from "@/components/form/ImageUploader";
import RegionPricingTable from "./RegionPricingTable";
import CheckoutTemplateSelector from "./CheckoutTemplateSelector";

interface Props {
    variant: Variant;
    index: number;
    regions: string[];
    onChange: (updated: Variant) => void;
    onDelete: () => void;
    onImageChange: (file: File | null, preview: string | null) => void;
}

export default function VariantCard({ variant, index, regions, onChange, onDelete, onImageChange }: Props) {
    const [collapsed, setCollapsed] = useState(false);

    const update = (partial: Partial<Variant>) => {
        onChange({ ...variant, ...partial });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header — always visible */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition bg-gray-50/50"
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-semibold text-white bg-gray-400 w-5 h-5 rounded flex items-center justify-center shrink-0">
                        {index + 1}
                    </span>
                    <span className="font-medium text-gray-800 truncate">
                        {variant.name || "Untitled Variant"}
                    </span>
                    {variant.quantity && variant.unit && (
                        <span className="text-xs text-gray-400 shrink-0">
                            · {variant.quantity} {variant.unit}
                        </span>
                    )}
                    <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                            variant.status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-400"
                        }`}
                    >
                        {variant.status}
                    </span>
                    {variant.isPopular && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 shrink-0">
                            Popular
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete variant"
                    >
                        <TbTrash size={15} />
                    </button>
                    {collapsed ? <TbChevronDown size={16} className="text-gray-400" /> : <TbChevronUp size={16} className="text-gray-400" />}
                </div>
            </div>

            {/* Body — collapsible */}
            {!collapsed && (
                <div className="border-t border-gray-100">
                    {/* ── Section: Basic Info ── */}
                    <div className="p-4 flex gap-4">
                        {/* Image */}
                        <div className="w-[110px] shrink-0">
                            <ImageUploader
                                imageUrl={variant.imageUrl || null}
                                aspectRatio={1}
                                compact
                                onChange={(file, preview) => {
                                    onImageChange(file, preview);
                                    update({ imageUrl: preview });
                                }}
                            />
                        </div>

                        {/* Fields */}
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Input
                                    label="Variant Name"
                                    placeholder="e.g. Gems 170"
                                    required
                                    value={variant.name}
                                    onChange={(e) => update({ name: e.target.value })}
                                />
                                <Input
                                    label="Quantity"
                                    type="number"
                                    placeholder="e.g. 170"
                                    value={variant.quantity ?? ""}
                                    onChange={(e) =>
                                        update({
                                            quantity: e.target.value ? parseInt(e.target.value) : null,
                                        })
                                    }
                                />
                                <Input
                                    label="Unit"
                                    placeholder="e.g. Gems"
                                    value={variant.unit || ""}
                                    onChange={(e) => update({ unit: e.target.value })}
                                />
                                <Input
                                    label="Delivery Time"
                                    placeholder="Instant Delivery"
                                    value={variant.deliveryTime}
                                    onChange={(e) => update({ deliveryTime: e.target.value })}
                                />
                            </div>

                            {/* Status + Popular inline */}
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <StatusToggle
                                        value={variant.status}
                                        onChange={(status) => update({ status })}
                                    />
                                    <span className="text-xs text-gray-500">
                                        {variant.status === "active" ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={variant.isPopular}
                                        onChange={(e) => update({ isPopular: e.target.checked })}
                                        className="rounded text-amber-500 focus:ring-amber-200"
                                    />
                                    <span className="text-xs text-gray-500">Mark as popular</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ── Section: Pricing ── */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Region Pricing
                        </p>
                        <RegionPricingTable
                            regions={regions}
                            pricing={variant.regionPricing}
                            onChange={(regionPricing) => update({ regionPricing })}
                        />
                    </div>

                    {/* ── Section: Checkout Template ── */}
                    <div className="px-4 py-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Checkout Configuration
                        </p>
                        <CheckoutTemplateSelector
                            selectedTemplate={variant.checkoutTemplate || ""}
                            templateOptions={variant.checkoutTemplateOptions || {}}
                            onTemplateChange={(checkoutTemplate) =>
                                update({ checkoutTemplate })
                            }
                            onOptionsChange={(checkoutTemplateOptions) =>
                                update({ checkoutTemplateOptions })
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
