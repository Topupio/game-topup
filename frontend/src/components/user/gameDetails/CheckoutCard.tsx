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

export default function CheckoutCard({
    variant,
    pricing,
    qty,
    updateQty,
    onProceed,
    isLoading,
}: Props) {
    const { symbol, price, discountedPrice } = pricing;

    const discountPerUnit = price - discountedPrice;
    const totalDiscount = (discountPerUnit * qty).toFixed(2);
    const totalAmount = (discountedPrice * qty).toFixed(2);

    const isDisabled = isLoading;

    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-lg font-bold text-secondary mb-4">
                Order Summary
            </h2>

            <div className="space-y-3 text-sm">
                {/* Product */}
                <div className="flex justify-between text-muted-foreground">
                    <span className="truncate mr-2">{variant.name}</span>
                    <span className="text-foreground font-semibold shrink-0">
                        {symbol}{price}
                    </span>
                </div>

                {/* Discount */}
                {discountPerUnit > 0 && (
                    <div className="flex justify-between text-tertiary">
                        <span>Discount</span>
                        <span>
                            -{symbol}{totalDiscount}
                        </span>
                    </div>
                )}

                {/* Itemized */}
                <div className="flex justify-between text-muted-foreground text-xs">
                    <span>
                        {symbol}{discountedPrice} &times; {qty}
                    </span>
                    <span>
                        {symbol}{totalAmount}
                    </span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between mt-4">
                    <span className="text-muted-foreground">Quantity</span>

                    <div className="flex items-center gap-2 bg-muted px-2 py-1.5 rounded-xl">
                        <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => updateQty(-1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-tertiary hover:bg-background transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RiSubtractLine className="w-4 h-4" />
                        </button>
                        <span className="text-foreground font-semibold min-w-[1.5rem] text-center">
                            {qty}
                        </span>
                        <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => updateQty(1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-tertiary hover:bg-background transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RiAddLine className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-3" />

                {/* Total */}
                <div className="flex justify-between text-foreground font-bold text-lg">
                    <span>Total</span>
                    <span>
                        {symbol}{totalAmount}
                    </span>
                </div>

                <button
                    onClick={onProceed}
                    disabled={isDisabled}
                    className="w-full mt-4 py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-tertiary hover:text-gray-950 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Proceed to Checkout"
                    )}
                </button>
            </div>
        </div>
    );
}
