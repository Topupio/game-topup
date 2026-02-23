"use client";

import { useState, useMemo } from "react";
import { Game, Variant, RegionPricing } from "@/lib/types/game";
import {
    CHECKOUT_TEMPLATES,
    TemplateField,
} from "@/lib/constants/checkoutTemplates";
import { getRegionByKey } from "@/lib/constants/regions";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import HeroHeader from "./HeroHeader";
import VariantGrid from "./VariantGrid";
import CheckoutCard from "./CheckoutCard";
import UserDetailsForm from "./UserDetailsForm";
import MobileCheckoutBar from "./MobileCheckoutBar";
import MobileCheckoutSheet from "./MobileCheckoutSheet";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import PayPalCheckout from "./PayPalCheckout";

function hasRichContent(html: string | undefined): boolean {
    if (!html) return false;
    const stripped = html.replace(/<[^>]*>/g, "").trim();
    return stripped.length > 0;
}

export default function GameDetailsPage({
    gameDetails,
}: {
    gameDetails: Game;
}) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        null
    );
    const [userDetails, setUserDetails] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [qty, setQty] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<{
        _id: string;
        orderId: string;
    } | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [activeRegion, setActiveRegion] = useState(() => {
        return gameDetails.regions?.[0] || "global";
    });
    const { user } = useAuth();
    const { currency: displayCurrency, formatPrice, rates } = useCurrency();
    const router = useRouter();

    // Resolve checkout fields from the selected variant's template + options
    const checkoutFields = useMemo(() => {
        if (!selectedVariant) return [];

        const templateKey = selectedVariant.checkoutTemplate;
        const template = CHECKOUT_TEMPLATES[templateKey];
        if (!template) return [];

        const options = selectedVariant.checkoutTemplateOptions || {};

        return template.fields
            .map((field) => {
                // UID topup: conditionally show zone field
                if (field.fieldKey === "zone_server") {
                    if (!options.zoneRequired) return null;
                    const raw = options.zoneOptions || [];
                    const customOptions = typeof raw === "string"
                        ? raw.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : Array.isArray(raw) ? raw : [];
                    return {
                        ...field,
                        required: true,
                        options:
                            customOptions.length > 0
                                ? customOptions
                                : field.options,
                    };
                }
                // Gift cards: apply custom region options
                if (
                    field.fieldKey === "region" &&
                    templateKey === "gift_cards"
                ) {
                    const raw = options.regionOptions || [];
                    const regionOptions = typeof raw === "string"
                        ? raw.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : Array.isArray(raw) ? raw : [];
                    if (regionOptions.length > 0) {
                        return { ...field, options: regionOptions };
                    }
                }
                return field;
            })
            .filter(Boolean) as TemplateField[];
    }, [selectedVariant]);

    // Get pricing for selected variant in active region
    const selectedPricing = useMemo<RegionPricing | null>(() => {
        if (!selectedVariant) return null;
        return (
            selectedVariant.regionPricing.find(
                (rp) => rp.region === activeRegion
            ) ||
            selectedVariant.regionPricing[0] ||
            null
        );
    }, [selectedVariant, activeRegion]);

    const updateQty = (change: number) => {
        setQty((prev) => Math.max(1, Math.min(99, prev + change)));
    };

    const updateUserDetails = (key: string, value: string) => {
        setUserDetails((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const validateFields = () => {
        const newErrors: Record<string, string> = {};

        checkoutFields.forEach((field) => {
            const value = userDetails[field.fieldKey];

            if (field.required && (!value || value.trim() === "")) {
                newErrors[field.fieldKey] = `${field.fieldName} is required`;
            }

            if (field.fieldType === "email" && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    newErrors[field.fieldKey] = "Invalid email address";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceedToCheckout = async () => {
        if (!user) {
            toast.error("Please login to place an order");
            router.push("/login");
            return;
        }

        if (!validateFields()) {
            toast.error("Please fill all required fields correctly");
            return;
        }

        if (!selectedVariant || !selectedPricing) {
            toast.error("Please select a package");
            return;
        }

        setIsSubmitting(true);
        try {
            const inputs = checkoutFields.map((field) => ({
                label: field.fieldName,
                value: userDetails[field.fieldKey] || "",
            }));

            const res = await ordersApiClient.create({
                gameId: gameDetails._id,
                productId: selectedVariant._id || "",
                qty,
                userInputs: inputs,
                currency: selectedPricing.currency || "USD",
                displayCurrency,
            });

            if (res.success) {
                setPendingOrder({
                    _id: res.data._id,
                    orderId: res.data.orderId,
                });
                setIsSheetOpen(false);
                setShowPayment(true);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to create order"
            );
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasMultipleRegions = gameDetails.regions.length > 1;

    return (
        <div className="text-foreground max-w-7xl mx-auto sm:py-22 py-20 pb-28 lg:pb-16">
            {/* Main Layout */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 px-4">
                {/* LEFT: Hero + Packages */}
                <div className="lg:w-2/3 w-full space-y-3">
                    {/* Hero Section */}
                    <HeroHeader
                        imageUrl={gameDetails.imageUrl || ""}
                        title={gameDetails.name}
                        subtitle={gameDetails.category}
                    />

                    {/* Mini Description */}
                    {gameDetails.description && (
                        <p className="text-sm text-muted-foreground mb-4 bg-muted/50 border border-border rounded-xl px-4 py-2.5 leading-relaxed">
                            {gameDetails.description}
                        </p>
                    )}

                    {/* Package Selection */}
                    <div className="space-y-6">
                        {/* Heading + Region selector */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">
                                Select a Package
                            </h2>

                            {hasMultipleRegions && (
                                <select
                                    value={activeRegion}
                                    onChange={(e) =>
                                        setActiveRegion(e.target.value)
                                    }
                                    className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-secondary"
                                >
                                    {gameDetails.regions.map((r) => {
                                        const region = getRegionByKey(r);
                                        return (
                                            <option key={r} value={r}>
                                                {region?.label || r} (
                                                {region?.symbol || "$"})
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        {/* Variant grid */}
                        <VariantGrid
                            variants={gameDetails.variants}
                            selectedVariant={selectedVariant}
                            onSelect={(v) => {
                                setSelectedVariant(v);
                                setQty(1);
                            }}
                            activeRegion={activeRegion}
                            gameImageUrl={gameDetails.imageUrl}
                        />

                        {/* Rich Description */}
                        {hasRichContent(gameDetails.richDescription) && (
                            <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
                                <div
                                    className="rich-description"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            gameDetails.richDescription!
                                        ),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Sidebar */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
                    {checkoutFields.length > 0 && (
                        <div className="hidden lg:block">
                            <UserDetailsForm
                                fields={checkoutFields}
                                value={userDetails}
                                errors={errors}
                                onChange={updateUserDetails}
                            />
                        </div>
                    )}

                    {selectedVariant && selectedPricing && (
                        <div className="hidden lg:block">
                            <CheckoutCard
                                variant={selectedVariant}
                                pricing={selectedPricing}
                                qty={qty}
                                updateQty={updateQty}
                                onProceed={handleProceedToCheckout}
                                isLoading={isSubmitting}
                            />
                        </div>
                    )}

                    {!selectedVariant && (
                        <div className="hidden lg:block bg-card border border-dashed border-border rounded-2xl p-6 text-center">
                            <p className="text-muted-foreground text-sm">
                                Select a package to see pricing details
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            {/* Mobile fixed bottom checkout bar */}
            {selectedVariant && selectedPricing && (
                <>
                    <MobileCheckoutBar
                        variant={selectedVariant}
                        pricing={selectedPricing}
                        qty={qty}
                        onOpenSheet={() => setIsSheetOpen(true)}
                    />
                    <MobileCheckoutSheet
                        isOpen={isSheetOpen}
                        onClose={() => setIsSheetOpen(false)}
                        variant={selectedVariant}
                        pricing={selectedPricing}
                        qty={qty}
                        updateQty={updateQty}
                        onProceed={handleProceedToCheckout}
                        isLoading={isSubmitting}
                        checkoutFields={checkoutFields}
                        userDetails={userDetails}
                        errors={errors}
                        onFieldChange={updateUserDetails}
                    />
                </>
            )}

            {/* PayPal Payment Modal */}
            {showPayment && pendingOrder && selectedPricing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                Complete Payment
                            </h3>
                            <button
                                onClick={() => {
                                    setShowPayment(false);
                                    toast.info(
                                        "Order saved. You can pay later from My Orders."
                                    );
                                }}
                                className="text-muted-foreground hover:text-foreground transition text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {(() => {
                            const nativeTotal = selectedPricing.discountedPrice * qty;
                            const nativeCurrency = selectedPricing.currency;
                            const isNonUSD = displayCurrency !== "USD";
                            const fromRate = rates[nativeCurrency] || 1;
                            const usdAmount = isNonUSD ? (nativeTotal / fromRate).toFixed(2) : null;

                            return (
                                <>
                                    <div className="mb-4 p-3 bg-muted rounded-xl text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Order</span>
                                            <span className="text-foreground font-mono text-xs">
                                                {pendingOrder.orderId}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-muted-foreground">
                                                Total
                                            </span>
                                            <span className="text-foreground font-bold">
                                                {formatPrice(nativeTotal, nativeCurrency)}
                                            </span>
                                        </div>
                                        {isNonUSD && (
                                            <>
                                                <div className="border-t border-border my-2" />
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        You pay (USD)
                                                    </span>
                                                    <span className="text-foreground font-bold text-secondary">
                                                        ~${usdAmount}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {isNonUSD && (
                                        <p className="text-xs text-muted-foreground mb-4 text-center">
                                            PayPal processes all payments in USD
                                        </p>
                                    )}
                                </>
                            );
                        })()}

                        <PayPalCheckout
                            orderId={pendingOrder._id}
                            amount=""
                            symbol=""
                            onSuccess={() => {
                                toast.success("Payment successful!");
                                router.push(
                                    `/orders/${pendingOrder._id}`
                                );
                            }}
                            onCancel={() => {
                                setShowPayment(false);
                                toast.info(
                                    "Payment cancelled. You can pay later from My Orders."
                                );
                            }}
                            onError={() => {
                                setShowPayment(false);
                                toast.error(
                                    "Payment failed. Please try again from My Orders."
                                );
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
