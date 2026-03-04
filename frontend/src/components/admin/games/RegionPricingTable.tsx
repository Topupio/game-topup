"use client";

import { useState } from "react";
import { RegionPricing } from "@/lib/types/game";
import { REGIONS, getRegionByKey } from "@/lib/constants/regions";

interface Props {
    regions: string[];
    pricing: RegionPricing[];
    onChange: (pricing: RegionPricing[]) => void;
}

/**
 * A price input that keeps the raw string while typing so users can enter
 * decimals like "0.01" without the value snapping back on each keystroke.
 */
function PriceInput({
    value,
    onChange,
    className,
}: {
    value: number;
    onChange: (v: number) => void;
    className?: string;
}) {
    const [draft, setDraft] = useState<string | null>(null);

    return (
        <input
            type="number"
            min="0"
            step="0.01"
            value={draft !== null ? draft : value || ""}
            placeholder="0.00"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
                if (draft !== null) {
                    onChange(parseFloat(draft) || 0);
                    setDraft(null);
                }
            }}
            className={className}
        />
    );
}

export default function RegionPricingTable({ regions, pricing, onChange }: Props) {
    const getPricing = (regionKey: string): RegionPricing | undefined => {
        return pricing.find((p) => p.region === regionKey);
    };

    const updatePricing = (regionKey: string, field: "price" | "discountedPrice", value: number) => {
        const region = getRegionByKey(regionKey);
        if (!region) return;

        const existing = pricing.find((p) => p.region === regionKey);

        if (existing) {
            onChange(
                pricing.map((p) =>
                    p.region === regionKey ? { ...p, [field]: value } : p
                )
            );
        } else {
            // Create new pricing entry for this region
            onChange([
                ...pricing,
                {
                    region: regionKey,
                    currency: region.currency,
                    symbol: region.symbol,
                    price: field === "price" ? value : 0,
                    discountedPrice: field === "discountedPrice" ? value : 0,
                },
            ]);
        }
    };

    if (regions.length === 0) {
        return (
            <p className="text-sm text-gray-500 italic">
                Select regions in the game settings to set pricing.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2 pr-4 font-medium">Region</th>
                        <th className="pb-2 pr-4 font-medium">Original Price</th>
                        <th className="pb-2 font-medium">Selling Price</th>
                    </tr>
                </thead>
                <tbody>
                    {regions.map((regionKey) => {
                        const region = getRegionByKey(regionKey);
                        if (!region) return null;

                        const rp = getPricing(regionKey);
                        const price = rp?.price ?? 0;
                        const discountedPrice = rp?.discountedPrice ?? 0;
                        const hasError = discountedPrice > price && price > 0;

                        return (
                            <tr key={regionKey} className="border-b last:border-b-0">
                                <td className="py-2 pr-4 text-gray-700 font-medium whitespace-nowrap">
                                    {region.label} ({region.symbol})
                                </td>
                                <td className="py-2 pr-4">
                                    <PriceInput
                                        value={price}
                                        onChange={(v) => updatePricing(regionKey, "price", v)}
                                        className="w-28 px-2 py-1.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                                    />
                                </td>
                                <td className="py-2">
                                    <PriceInput
                                        value={discountedPrice}
                                        onChange={(v) => updatePricing(regionKey, "discountedPrice", v)}
                                        className={`w-28 px-2 py-1.5 rounded border text-sm focus:ring-2 focus:ring-blue-200 outline-none ${
                                            hasError
                                                ? "border-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:border-blue-500"
                                        }`}
                                    />
                                    {hasError && (
                                        <p className="text-xs text-red-500 mt-0.5">
                                            Cannot exceed original price
                                        </p>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
