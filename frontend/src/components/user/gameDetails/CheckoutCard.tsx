"use client";

import { RiAddLine, RiSubtractLine } from "react-icons/ri";

export default function CheckoutCard({ product, qty, updateQty, onProceed, isLoading }: any) {
    const price = product.price;
    const discountedPrice = product.discountedPrice ?? product.price;

    const discountPerUnit = price - discountedPrice;
    const totalDiscount = discountPerUnit * qty;
    const totalAmount = discountedPrice * qty;

    const isDisabled = isLoading || product.status !== "active";

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-lg font-bold text-secondary mb-4">Selected Product</h2>

            <div className="space-y-3 text-sm">

                {/* Product */}
                <div className="flex justify-between text-muted-foreground">
                    <span>{product.name}</span>
                    <span className="text-foreground font-semibold">₹{price}</span>
                </div>

                {/* Discount */}
                {discountPerUnit > 0 && (
                    <div className="flex justify-between text-tertiary">
                        <span>Discount</span>
                        <span>-₹{totalDiscount}</span>
                    </div>
                )}

                {/* Itemized Total */}
                <div className="flex justify-between text-muted-foreground text-xs">
                    <span>{discountedPrice} × {qty}</span>
                    <span>₹{totalAmount}</span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between mt-4">
                    <span className="text-muted-foreground">Quantity</span>

                    <div className="flex items-center gap-3 bg-muted px-3 py-2 rounded-xl">
                        <RiSubtractLine
                            className={`cursor-pointer text-tertiary ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !isDisabled && updateQty(-1)}
                        />
                        <span className="text-foreground font-semibold">{qty}</span>
                        <RiAddLine
                            className={`cursor-pointer text-tertiary ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !isDisabled && updateQty(1)}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-3" />

                {/* Total */}
                <div className="flex justify-between text-foreground font-bold text-base">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                </div>

                <button
                    onClick={onProceed}
                    disabled={isDisabled}
                    className="w-full mt-6 py-3 rounded-xl bg-secondary hover:text-gray-950 font-semibold hover:bg-tertiary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
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
