"use client";

import { Variant } from "@/lib/types/game";
import { TbPlus } from "react-icons/tb";
import VariantCard from "./VariantCard";

interface Props {
    variants: Variant[];
    regions: string[];
    onChange: (variants: Variant[]) => void;
    onVariantImageChange?: (index: number, file: File | null, preview: string | null) => void;
}

export default function VariantManager({ variants, regions, onChange, onVariantImageChange }: Props) {
    const addVariant = () => {
        const newVariant: Variant = {
            name: "",
            slug: "",
            quantity: null,
            unit: "",
            regionPricing: [],
            status: "active",
            isPopular: false,
            deliveryTime: "Instant Delivery",
            imageUrl: null,
            imagePublicId: null,
            checkoutTemplate: "",
            checkoutTemplateOptions: {},
        };
        onChange([...variants, newVariant]);
    };

    const updateVariant = (index: number, updated: Variant) => {
        const copy = [...variants];
        copy[index] = updated;
        onChange(copy);
    };

    const deleteVariant = (index: number) => {
        onChange(variants.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {variants.length} variant{variants.length !== 1 ? "s" : ""}
                </p>
                <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition font-medium"
                >
                    <TbPlus size={16} /> Add Variant
                </button>
            </div>

            {variants.length === 0 ? (
                <div className="text-center py-8 bg-muted rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground text-sm">
                        No variants yet. Click "Add Variant" to add items/packages.
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                        e.g., Gems 80, Gems 170, Brawl Pass
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {variants.map((variant, i) => (
                        <VariantCard
                            key={variant._id || `new-${i}`}
                            variant={variant}
                            index={i}
                            regions={regions}
                            onChange={(updated) => updateVariant(i, updated)}
                            onDelete={() => deleteVariant(i)}
                            onImageChange={(file, preview) => onVariantImageChange?.(i, file, preview)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
