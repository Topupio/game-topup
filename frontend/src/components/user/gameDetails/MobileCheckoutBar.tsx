"use client";

import { Variant, RegionPricing } from "@/lib/types/game";

interface Props {
    variant: Variant;
    pricing: RegionPricing;
    qty: number;
    onOpenSheet: () => void;
}

export default function MobileCheckoutBar({
    variant,
    pricing,
    qty,
    onOpenSheet,
}: Props) {
    const { symbol, price, discountedPrice } = pricing;
    const hasDiscount = price > discountedPrice;
    const totalAmount = (discountedPrice * qty).toFixed(2);
    const totalSavings = ((price - discountedPrice) * qty).toFixed(2);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:hidden">
            <div className="px-4 py-3 flex items-center justify-between gap-3 max-w-screen-sm mx-auto">
                {/* Left: Variant info */}
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
                                {symbol}{(price * qty).toFixed(2)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {symbol}{discountedPrice} each
                        </span>
                    )}
                </div>

                {/* Right: CTA Button with price */}
                <button
                    onClick={onOpenSheet}
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-secondary text-white font-semibold hover:bg-tertiary hover:text-gray-950 transition flex items-center justify-center gap-1.5 text-sm"
                >
                    Top-up Now &middot; {symbol}{totalAmount}
                </button>
            </div>
        </div>
    );
}
