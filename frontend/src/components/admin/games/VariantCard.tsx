"use client";

import { useState } from "react";
import { Variant } from "@/lib/types/game";
import { TbTrash, TbChevronDown, TbChevronUp } from "react-icons/tb";
import Input from "@/components/form/Input";
import StatusToggle from "@/components/form/StatusToggle";
import RegionPricingTable from "./RegionPricingTable";

interface Props {
    variant: Variant;
    index: number;
    regions: string[];
    onChange: (updated: Variant) => void;
    onDelete: () => void;
}

export default function VariantCard({ variant, index, regions, onChange, onDelete }: Props) {
    const [collapsed, setCollapsed] = useState(false);

    const update = (partial: Partial<Variant>) => {
        onChange({ ...variant, ...partial });
    };

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* Header — always visible */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-400 bg-gray-200 px-2 py-0.5 rounded shrink-0">
                        #{index + 1}
                    </span>
                    <span className="font-medium text-gray-800 truncate">
                        {variant.name || "Untitled Variant"}
                    </span>
                    {variant.quantity && variant.unit && (
                        <span className="text-xs text-gray-500 shrink-0">
                            {variant.quantity} {variant.unit}
                        </span>
                    )}
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            variant.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-500"
                        }`}
                    >
                        {variant.status}
                    </span>
                    {variant.isPopular && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                            Popular
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                        title="Delete variant"
                    >
                        <TbTrash size={16} />
                    </button>
                    {collapsed ? <TbChevronDown size={18} /> : <TbChevronUp size={18} />}
                </div>
            </div>

            {/* Body — collapsible */}
            {!collapsed && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
                    {/* Row 1: Name, Quantity, Unit, Delivery Time — all on one row */}
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

                    {/* Row 2: Status + Popular — compact inline */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <StatusToggle
                                value={variant.status}
                                onChange={(status) => update({ status })}
                            />
                            <span className="text-sm text-gray-600">
                                {variant.status === "active" ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={variant.isPopular}
                                onChange={(e) => update({ isPopular: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-600">Popular</span>
                        </label>
                    </div>

                    {/* Row 3: Region Pricing */}
                    <RegionPricingTable
                        regions={regions}
                        pricing={variant.regionPricing}
                        onChange={(regionPricing) => update({ regionPricing })}
                    />
                </div>
            )}
        </div>
    );
}
