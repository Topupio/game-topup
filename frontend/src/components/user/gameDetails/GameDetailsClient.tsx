"use client";

import { useState } from "react";
import { GameWithProducts } from "@/lib/types/game";
import { Product } from "@/lib/types/product";
import HeroHeader from "./HeroHeader";
import Tabs from "./Tabs";
import ProductGrid from "./ProductGrid";
import CheckoutCard from "./CheckoutCard";
import OverviewTab from "./OverviewTab";
import HowToTab from "./HowToTab";
import UserDetailsForm from "./UserDetailsForm";

export default function GameDetailsClient({ gameDetails }: { gameDetails: GameWithProducts }) {
    const [activeTab, setActiveTab] = useState("products");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [userDetails, setUserDetails] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [qty, setQty] = useState(1);

    const updateQty = (change: number) => {
        setQty((prev) => Math.max(1, prev + change));
    };

    const updateUserDetails = (key: string, value: string) => {
        setUserDetails((prev) => ({
            ...prev,
            [key]: value,
        }));

        // Clear error when user types
        setErrors((prev) => ({
            ...prev,
            [key]: "",
        }));
    };

    const validateFields = () => {
        const newErrors: Record<string, string> = {};

        gameDetails.requiredFields?.forEach((field) => {
            const value = userDetails[field.fieldKey];

            if (field.required && (!value || value.toString().trim() === "")) {
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

    const handleProceedToCheckout = () => {
        if (!validateFields()) {
            console.log("Validation failed");
            return;
        }

        console.log("Checkout Data:", {
            product: selectedProduct,
            quantity: qty,
            userDetails,
        });
    };

    return (
        <div className="text-white max-w-7xl mx-auto py-16">

            {/* ---------------- Hero Section ---------------- */}
            <HeroHeader
                imageUrl={gameDetails.imageUrl || ""}
                title={gameDetails.name}
            // subtitle={gameDetails.}
            />

            {/* ---------------- Tabs ---------------- */}
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ---------------- Main Layout ---------------- */}
            <div className="max-w-7xl mx-auto mt-8 flex flex-col lg:flex-row gap-10 px-4 lg:px-0">

                {/* ---------------- LEFT CONTENT ---------------- */}
                <div className="lg:w-2/3 w-full">
                    {activeTab === "overview" && <OverviewTab />}

                    {activeTab === "products" && (
                        <ProductGrid
                            selectedProduct={selectedProduct}
                            setSelectedProduct={(p: Product) => {
                                setSelectedProduct(p);
                                setQty(1);
                            }}
                            products={gameDetails.products}
                        />
                    )}

                    {activeTab === "how" && <HowToTab />}
                </div>

                {/* ---------------- CHECKOUT + USER DETAILS ---------------- */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6">

                    <UserDetailsForm
                        fields={gameDetails.requiredFields || []}
                        value={userDetails}
                        errors={errors}
                        onChange={updateUserDetails}
                    />

                    {/* Checkout Box */}
                    {selectedProduct && (
                        <CheckoutCard
                            product={selectedProduct}
                            qty={qty}
                            updateQty={updateQty}
                            onProceed={handleProceedToCheckout}
                        />
                    )}
                </aside>
            </div>
        </div>
    );
}
