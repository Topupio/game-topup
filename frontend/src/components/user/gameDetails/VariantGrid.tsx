"use client";

import { Variant, RegionPricing } from "@/lib/types/game";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
    variants: Variant[];
    selectedVariant: Variant | null;
    onSelect: (v: Variant) => void;
    activeRegion: string;
    gameImageUrl?: string | null;
}

function getPrice(variant: Variant, region: string): RegionPricing | null {
    return (
        variant.regionPricing.find((rp) => rp.region === region) ||
        variant.regionPricing[0] ||
        null
    );
}

export default function VariantGrid({
    variants,
    selectedVariant,
    onSelect,
    activeRegion,
    gameImageUrl,
}: Props) {
    const { formatPrice } = useCurrency();
    const activeVariants = variants.filter((v) => v.status === "active");

    if (activeVariants.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No packages available at the moment.</p>
                <p className="text-sm mt-1">Please check back later.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3">
            {activeVariants.map((variant) => {
                const pricing = getPrice(variant, activeRegion);
                const isSelected =
                    selectedVariant?._id === variant._id ||
                    selectedVariant?.slug === variant.slug;
                const discountPercent =
                    pricing && pricing.price > 0
                        ? Math.round(
                              ((pricing.price - pricing.discountedPrice) /
                                  pricing.price) *
                                  100
                          )
                        : 0;

                const imageUrl = variant.imageUrl || gameImageUrl || null;

                return (
                    <div
                        key={variant._id || variant.slug}
                        onClick={() => onSelect(variant)}
                        className={`group relative cursor-pointer rounded-2xl p-2 sm:p-3 border transition-all duration-300 ease-out ${
                            isSelected
                                ? "border-secondary bg-secondary/10 ring-2 ring-secondary/40 shadow-md"
                                : "border-border bg-card hover:border-secondary/60 hover:bg-muted hover:shadow-md shadow-sm"
                        }`}
                    >
                        {/* Selected badge */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 z-10 bg-secondary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Selected
                            </div>
                        )}

                        {/* Popular badge */}
                        {variant.isPopular && !isSelected && (
                            <div className="absolute top-2 right-2 z-10 bg-tertiary text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                Popular
                            </div>
                        )}

                        {/* Discount badge */}
                        {discountPercent > 0 && (
                            <div className="absolute top-2 left-2 bg-tertiary text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10">
                                {discountPercent}% OFF
                            </div>
                        )}

                        {/* Image */}
                        {imageUrl && (
                            <div className="relative overflow-hidden rounded-xl aspect-square">
                                <img
                                    src={imageUrl}
                                    alt={variant.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className={`${imageUrl ? "mt-2 sm:mt-3" : "mt-1"} space-y-0.5 sm:space-y-1`}
                        >
                            <h3
                                className={`text-base text-left font-semibold tracking-wide truncate ${
                                    isSelected
                                        ? "text-secondary"
                                        : "text-foreground group-hover:text-secondary"
                                }`}
                            >
                                {variant.name}
                            </h3>

                            {variant.quantity && variant.unit && (
                                <p className="text-[10px] text-left sm:text-xs text-muted-foreground">
                                    {variant.quantity} {variant.unit}
                                </p>
                            )}

                           
                        </div>

                        {/* Price */}
                        {pricing && (
                            <div className="mt-2 sm:mt-3 space-y-0.5">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <span className="text-secondary font-bold text-lg">
                                        {formatPrice(pricing.discountedPrice, pricing.currency)}
                                    </span>

                                    {discountPercent > 0 && (
                                        <span className="text-muted-foreground text-sm line-through">
                                            {formatPrice(pricing.price, pricing.currency)}
                                        </span>
                                    )}
                                </div>

                                {discountPercent > 0 && (
                                    <p className="text-tertiary text-xs sm:text-sm font-medium">
                                        Save {formatPrice(pricing.price - pricing.discountedPrice, pricing.currency)}
                                    </p>
                                )}
                            </div>
                        )}

                    </div>
                );
            })}
        </div>
    );
}
