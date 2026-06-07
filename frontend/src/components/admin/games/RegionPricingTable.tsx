"use client";

import { useId, useState } from "react";
import { RegionPricing } from "@/lib/types/game";

interface Props {
    pricing: RegionPricing[];
    onChange: (pricing: RegionPricing[]) => void;
}

const GLOBAL_PRICING = {
    region: "global",
    currency: "USD",
    symbol: "$",
};

/**
 * A price input that keeps the raw string while typing so users can enter
 * decimals like "0.01" without the value snapping back on each keystroke.
 */
function PriceInput({
    id,
    label,
    value,
    onChange,
    className,
}: {
    id: string;
    label: string;
    value: number;
    onChange: (v: number) => void;
    className?: string;
}) {
    const [draft, setDraft] = useState<string | null>(null);

    return (
        <input
            id={id}
            type="number"
            aria-label={label}
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

export default function RegionPricingTable({ pricing, onChange }: Props) {
    const idPrefix = useId();
    const currentPricing = pricing.find((p) => p.region === "global") || pricing[0];
    const price = currentPricing?.price ?? 0;
    const discountedPrice = currentPricing?.discountedPrice ?? 0;
    const hasError = discountedPrice > price && price > 0;

    const updatePricing = (field: "price" | "discountedPrice", value: number) => {
        const nextPricing: RegionPricing = {
            ...GLOBAL_PRICING,
            price: field === "price" ? value : price,
            discountedPrice: field === "discountedPrice" ? value : discountedPrice,
        };

        onChange([nextPricing]);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label htmlFor={`${idPrefix}-original-price`} className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Original Price (USD)</span>
                <PriceInput
                    id={`${idPrefix}-original-price`}
                    label="Original price in USD"
                    value={price}
                    onChange={(v) => updatePricing("price", v)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
            </label>
            <label htmlFor={`${idPrefix}-selling-price`} className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Selling Price (USD)</span>
                <PriceInput
                    id={`${idPrefix}-selling-price`}
                    label="Selling price in USD"
                    value={discountedPrice}
                    onChange={(v) => updatePricing("discountedPrice", v)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-200 outline-none ${
                        hasError
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 focus:border-blue-500"
                    }`}
                />
                {hasError && (
                    <p className="text-xs text-red-500">
                        Selling price cannot exceed original price
                    </p>
                )}
            </label>
        </div>
    );
}
