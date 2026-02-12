"use client";

import { useState, useMemo } from "react";
import { Game, Variant, RegionPricing } from "@/lib/types/game";
import {
    CHECKOUT_TEMPLATES,
    TemplateField,
} from "@/lib/constants/checkoutTemplates";
import { getRegionByKey } from "@/lib/constants/regions";
import HeroHeader from "./HeroHeader";
import VariantGrid from "./VariantGrid";
import CheckoutCard from "./CheckoutCard";
import UserDetailsForm from "./UserDetailsForm";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function GameDetailsClient({
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
    const [activeRegion, setActiveRegion] = useState(() => {
        return gameDetails.regions?.[0] || "global";
    });
    const router = useRouter();

    // Resolve checkout fields from template + game options
    const checkoutFields = useMemo(() => {
        const template = CHECKOUT_TEMPLATES[gameDetails.checkoutTemplate];
        if (!template) return [];

        const options = gameDetails.checkoutTemplateOptions || {};

        return template.fields
            .map((field) => {
                // UID topup: conditionally show zone field
                if (field.fieldKey === "zone_server") {
                    if (!options.zoneRequired) return null;
                    const customOptions = options.zoneOptions || [];
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
                    gameDetails.checkoutTemplate === "gift_cards"
                ) {
                    const regionOptions = options.regionOptions || [];
                    if (regionOptions.length > 0) {
                        return { ...field, options: regionOptions };
                    }
                }
                return field;
            })
            .filter(Boolean) as TemplateField[];
    }, [gameDetails.checkoutTemplate, gameDetails.checkoutTemplateOptions]);

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

            const productSnapshot = {
                name: selectedVariant.name,
                price: selectedPricing.price,
                discountedPrice: selectedPricing.discountedPrice,
                deliveryTime: selectedVariant.deliveryTime,
                qty,
                totalAmount: selectedPricing.discountedPrice * qty,
            };

            const res = await ordersApiClient.create({
                gameId: gameDetails._id,
                productId: selectedVariant._id || "",
                qty,
                userInputs: inputs,
                // @ts-ignore
                productSnapshot,
            });

            if (res.success) {
                toast.success("Order placed successfully!");
                router.push(`/orders/${res.data._id}`);
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
        <div className="text-foreground max-w-7xl mx-auto py-16">
            {/* Hero Section */}
            <HeroHeader
                imageUrl={gameDetails.imageUrl || ""}
                title={gameDetails.name}
                subtitle={gameDetails.category}
            />

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto mt-8 flex flex-col lg:flex-row gap-8 px-4 lg:px-0">
                {/* LEFT: Packages */}
                <div className="lg:w-2/3 w-full space-y-6">
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

                    {/* Description */}
                    {gameDetails.description && (
                        <div className="mt-8 space-y-3">
                            <h3 className="text-lg font-semibold text-foreground">
                                About
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {gameDetails.description}
                            </p>
                        </div>
                    )}

                    {/* How to top-up */}
                    <div className="mt-6 space-y-3">
                        <h3 className="text-lg font-semibold text-foreground">
                            How to Top-up
                        </h3>
                        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground text-sm">
                            <li>Enter your game details correctly</li>
                            <li>Select your desired package</li>
                            <li>Complete secure checkout</li>
                            <li>Receive your items instantly</li>
                        </ol>
                    </div>
                </div>

                {/* RIGHT: Sidebar */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
                    {checkoutFields.length > 0 && (
                        <UserDetailsForm
                            fields={checkoutFields}
                            value={userDetails}
                            errors={errors}
                            onChange={updateUserDetails}
                        />
                    )}

                    {selectedVariant && selectedPricing && (
                        <CheckoutCard
                            variant={selectedVariant}
                            pricing={selectedPricing}
                            qty={qty}
                            updateQty={updateQty}
                            onProceed={handleProceedToCheckout}
                            isLoading={isSubmitting}
                        />
                    )}

                    {!selectedVariant && (
                        <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center">
                            <p className="text-muted-foreground text-sm">
                                Select a package to see pricing details
                            </p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
