"use client";

import { useEffect } from "react";
import { Variant, RegionPricing } from "@/lib/types/game";
import { TemplateField } from "@/lib/constants/checkoutTemplates";
import { RiCloseLine, RiAddLine, RiSubtractLine, RiArrowDownSLine } from "react-icons/ri";
import { useCurrency } from "@/context/CurrencyContext";

function capitalize(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    variant: Variant;
    pricing: RegionPricing;
    qty: number;
    updateQty: (change: number) => void;
    onProceed: () => void;
    isLoading: boolean;
    checkoutFields: TemplateField[];
    userDetails: Record<string, string>;
    errors: Record<string, string>;
    onFieldChange: (key: string, value: string) => void;
}

export default function MobileCheckoutSheet({
    isOpen,
    onClose,
    variant,
    pricing,
    qty,
    updateQty,
    onProceed,
    isLoading,
    checkoutFields,
    userDetails,
    errors,
    onFieldChange,
}: Props) {
    const { formatPrice } = useCurrency();
    const { price, discountedPrice, currency } = pricing;
    const hasDiscount = price > discountedPrice;
    const totalAmount = discountedPrice * qty;
    const totalSavings = (price - discountedPrice) * qty;

    // Lock body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <div className="lg:hidden">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out max-h-[85vh] flex flex-col ${
                    isOpen ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
                    <div>
                        <h3 className="text-base font-bold text-foreground">
                            {variant.name}
                        </h3>
                        {hasDiscount && (
                            <span className="text-xs font-medium text-green-500">
                                Save {formatPrice(totalSavings, currency)}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-muted transition"
                    >
                        <RiCloseLine size={22} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {/* Quantity selector */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                            Quantity
                        </span>
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

                    {/* User details form */}
                    {checkoutFields.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-secondary">
                                Enter Your Details
                            </h4>

                            {checkoutFields.map((field) => (
                                <div key={field.fieldKey} className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-foreground">
                                        {capitalize(field.fieldName)}
                                        {field.required && (
                                            <span className="text-red-400"> *</span>
                                        )}
                                    </label>

                                    {field.fieldType !== "dropdown" ? (
                                        <input
                                            type={field.fieldType}
                                            value={userDetails[field.fieldKey] || ""}
                                            onChange={(e) =>
                                                onFieldChange(field.fieldKey, e.target.value)
                                            }
                                            placeholder={
                                                field.placeholder ||
                                                `Enter ${capitalize(field.fieldName)}`
                                            }
                                            className={`px-3.5 py-2.5 bg-input border text-foreground text-sm rounded-xl placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all ${
                                                errors[field.fieldKey]
                                                    ? "border-red-500"
                                                    : "border-border focus:border-secondary"
                                            }`}
                                        />
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={userDetails[field.fieldKey] || ""}
                                                onChange={(e) =>
                                                    onFieldChange(field.fieldKey, e.target.value)
                                                }
                                                className={`w-full px-3.5 py-2.5 bg-input border text-foreground text-sm rounded-xl placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all appearance-none ${
                                                    errors[field.fieldKey]
                                                        ? "border-red-500"
                                                        : "border-border focus:border-secondary"
                                                }`}
                                            >
                                                <option value="" className="text-black">
                                                    {field.placeholder ||
                                                        `Select ${capitalize(field.fieldName)}`}
                                                </option>
                                                {Array.isArray(field.options) && field.options.map((opt: string) => (
                                                    <option
                                                        key={opt}
                                                        value={opt}
                                                        className="text-black"
                                                    >
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                            <RiArrowDownSLine className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                                        </div>
                                    )}

                                    {errors[field.fieldKey] && (
                                        <p className="text-red-500 text-xs">
                                            {errors[field.fieldKey]}
                                        </p>
                                    )}
                                </div>
                            ))}

                            <p className="text-xs text-muted-foreground">
                                Make sure details are correct. Wrong information may
                                cause delivery delays.
                            </p>
                        </div>
                    )}

                    {/* Order summary */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2.5">
                        <h4 className="text-sm font-bold text-foreground">
                            Order Summary
                        </h4>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span className="truncate mr-2">{variant.name}</span>
                            <span className="text-foreground font-medium shrink-0">
                                {formatPrice(price, currency)}
                            </span>
                        </div>
                        {hasDiscount && (
                            <div className="flex justify-between text-sm text-green-500">
                                <span>Discount</span>
                                <span>-{formatPrice(price - discountedPrice, currency)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                                {formatPrice(discountedPrice, currency)} &times; {qty}
                            </span>
                            <span>{formatPrice(totalAmount, currency)}</span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between text-foreground font-bold text-sm">
                            <span>Total</span>
                            <span>{formatPrice(totalAmount, currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Sticky CTA */}
                <div className="px-5 py-4 border-t border-border bg-card">
                    <button
                        onClick={onProceed}
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-secondary text-white font-semibold hover:bg-tertiary hover:text-gray-950 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Confirm &amp; Pay &middot; {formatPrice(totalAmount, currency)}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
