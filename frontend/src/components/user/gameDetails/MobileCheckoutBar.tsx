"use client";

import { Variant, RegionPricing } from "@/lib/types/game";
import { RiAddLine, RiSubtractLine } from "react-icons/ri";

interface Props {
    variant: Variant;
    pricing: RegionPricing;
    qty: number;
    updateQty: (change: number) => void;
    onProceed: () => void;
    isLoading: boolean;
}

export default function MobileCheckoutBar({
    variant,
    pricing,
    qty,
    updateQty,
    onProceed,
    isLoading,
}: Props) {
    const { symbol, price, discountedPrice } = pricing;
    const hasDiscount = price > discountedPrice;
    const totalAmount = discountedPrice * qty;
    const totalSavings = (price - discountedPrice) * qty;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:hidden">
            <div className="px-4 py-3 space-y-3 max-w-screen-sm mx-auto">
                {/* Row 1: Variant info + Quantity */}
                <div className="flex items-center justify-between gap-3">
                    {/* Variant name + savings */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">
                            {variant.name}
                        </span>
                        {hasDiscount ? (
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-green-500">
                                    Save {symbol}{totalSavings}
                                </span>
                                <span className="text-xs text-muted-foreground line-through">
                                    {symbol}{price * qty}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                {symbol}{discountedPrice} each
                            </span>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-1">Qty</span>
                        <div className="flex items-center gap-3 bg-muted px-3 py-1.5 rounded-xl">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => updateQty(-1)}
                                className="text-tertiary disabled:opacity-50"
                            >
                                <RiSubtractLine size={18} />
                            </button>
                            <span className="text-foreground font-semibold min-w-[1.25rem] text-center">
                                {qty}
                            </span>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => updateQty(1)}
                                className="text-tertiary disabled:opacity-50"
                            >
                                <RiAddLine size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 2: CTA Button with price */}
                <button
                    onClick={onProceed}
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-tertiary hover:text-gray-950 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>Top-up Now &middot; {symbol}{totalAmount}</>
                    )}
                </button>
            </div>
        </div>
    );
}
