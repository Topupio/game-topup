"use client";

import { REGIONS } from "@/lib/constants/regions";

interface Props {
    selectedRegions: string[];
    onChange: (regions: string[]) => void;
    error?: string;
}

export default function RegionMultiSelect({ selectedRegions, onChange, error }: Props) {
    const toggle = (key: string) => {
        if (selectedRegions.includes(key)) {
            // Don't allow deselecting the last region
            if (selectedRegions.length === 1) return;
            onChange(selectedRegions.filter((r) => r !== key));
        } else {
            onChange([...selectedRegions, key]);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
                Regions Available <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
                {REGIONS.map((region) => {
                    const isSelected = selectedRegions.includes(region.key);
                    return (
                        <button
                            key={region.key}
                            type="button"
                            onClick={() => toggle(region.key)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition ${
                                isSelected
                                    ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {region.label} ({region.symbol})
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs text-gray-500">
                Select at least one region. Variants will have pricing per selected region.
            </p>
        </div>
    );
}
