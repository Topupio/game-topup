"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

import { Product, ProductPayload } from "@/lib/types/product";
import { productsApiClient } from "@/services/products";
import { useAdminForm } from "@/hooks/useAdminForm";

import FormWrapper from "@/components/admin/form/FormWrapper";
import FormSection from "@/components/admin/form/FormSection";
import Input from "@/components/form/Input";
import ImageUploader from "@/components/form/ImageUploader";
import StatusToggle from "@/components/form/StatusToggle";
import Textarea from "@/components/form/TextArea";
import FilterDropdown from "@/components/admin/shared/FilterDropdown";
import { gamesApiClient, Game } from "@/services/games";
import { useState } from "react";

interface ProductFormProps {
    productId: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
    const isEdit = productId !== "new";
    const [games, setGames] = useState<Game[]>([]);

    const {
        form,
        updateForm,
        loading,
        errors,
        updateError,
        clearError,
        handleSubmit,
    } = useAdminForm<ProductPayload & { imageFile?: File | null }>(
        {
            gameId: "",
            name: "",
            description: "",
            image: null,
            price: 0,
            discountedPrice: 0,
            deliveryTime: "Instant Delivery",
            status: "active",
            isPopular: false,
            imageFile: null,
        },
        {
            onSuccess: () => {
                toast.success(isEdit ? "Product updated successfully" : "Product created successfully");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to save product");
            },
            redirectPath: "/admin/products",
        }
    );

    /* Load games and product data */
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await gamesApiClient.list({ status: 'active', limit: 100 });
                setGames(res.data);
            } catch (error) {
                console.error("Failed to fetch games", error);
            }
        };
        fetchGames();

        if (!isEdit) return;

        (async () => {
            try {
                const res = await productsApiClient.get(productId as string);
                const product: Product = res.data;
                updateForm({
                    gameId: product.gameId,
                    name: product.name,
                    description: product.description ?? "",
                    image: product.imageUrl ?? null,
                    price: product.price,
                    discountedPrice: product.discountedPrice,
                    deliveryTime: product.deliveryTime ?? "Instant Delivery",
                    status: product.status,
                    isPopular: product.isPopular ?? false,
                    imageFile: null,
                });
            } catch (err) {
                console.error(err);
                toast.error("Failed to load product");
            }
        })();
    }, [productId, isEdit, updateForm]);

    /* Validation */
    const validate = (): boolean => {
        clearError("name");
        clearError("price");
        clearError("discountedPrice");
        clearError("gameId");

        let isValid = true;

        if (!form.name?.trim()) {
            updateError("name", "Product name is required");
            isValid = false;
        }

        if (!form.gameId) {
            updateError("gameId", "Game selection is required");
            isValid = false;
        }

        const price = Number(form.price);
        const discountedPrice = Number(form.discountedPrice);

        if (isNaN(price) || price <= 0) {
            updateError("price", "Price must be a positive number");
            isValid = false;
        }

        if (isNaN(discountedPrice) || discountedPrice <= 0) {
            updateError("discountedPrice", "Discounted price cannot be negative or zero");
            isValid = false;
        } else if (discountedPrice > price) {
            updateError("discountedPrice", "Discounted price cannot exceed the original price");
            isValid = false;
        }

        return isValid;
    };

    /* Submit */
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix validation errors");
            return;
        }

        await handleSubmit(async (formData) => {
            const payload: ProductPayload = {
                gameId: formData.gameId,
                name: formData.name,
                description: formData.description,
                price: formData.price,
                discountedPrice: formData.discountedPrice,
                deliveryTime: formData.deliveryTime,
                status: formData.status,
                isPopular: formData.isPopular,
                image: (formData.imageFile as File) ?? null,
            };

            if (isEdit) {
                await productsApiClient.update(productId, payload);
            } else {
                await productsApiClient.create(payload);
            }
        }, e);
    };

    return (
        <FormWrapper
            title={isEdit ? "Update Product" : "Create New Product"}
            isEdit={isEdit}
            loading={loading}
            onSubmit={onSubmit}
            submitLabel={isEdit ? "Update Product" : "Create Product"}
        >
            {/* Basic Info */}
            <FormSection title="Basic Information">
                <ImageUploader
                    imageUrl={form.image || null}
                    aspectRatio={1}
                    onChange={(file, preview) => {
                        updateForm({
                            imageFile: file,
                            image: preview,
                        });
                    }}
                />

                <div className="grid grid-cols-1 gap-6">
                    <Input
                        label="Product Name"
                        value={form.name}
                        error={errors.name}
                        required
                        onChange={(e) => {
                            updateForm({ name: e.target.value });
                            clearError("name");
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FilterDropdown
                        label="Select Game"
                        options={games.map(g => ({ label: g.name, value: g._id }))}
                        value={form.gameId}
                        error={errors.gameId}
                        onChange={(val) => {
                            updateForm({ gameId: val });
                            clearError("gameId");
                        }}
                        placeholder="Choose a game..."
                        className="w-full"
                    />

                    <Input
                        label="Delivery Time"
                        value={form.deliveryTime}
                        onChange={(e) =>
                            updateForm({ deliveryTime: e.target.value })
                        }
                    />
                </div>

                <Textarea
                    label="Description"
                    value={form.description}
                    onChange={(e) =>
                        updateForm({ description: e.target.value })
                    }
                />
            </FormSection>

            {/* Pricing & Settings */}
            <FormSection title="Pricing & Settings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Price"
                        type="number"
                        value={form.price}
                        error={errors.price}
                        required
                        onChange={(e) => {
                            updateForm({ price: Number(e.target.value) });
                            clearError("price");
                        }}
                    />

                    <Input
                        label="Discounted Price"
                        type="number"
                        value={form.discountedPrice}
                        error={errors.discountedPrice}
                        required
                        onChange={(e) => {
                            updateForm({
                                discountedPrice: Number(e.target.value),
                            });
                            clearError("discountedPrice");
                        }}
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="font-medium block mb-2">Status</label>
                        <StatusToggle
                            value={form.status}
                            onChange={(s) => updateForm({ status: s })}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isPopular}
                                onChange={(e) =>
                                    updateForm({ isPopular: e.target.checked })
                                }
                                className="rounded"
                            />
                            <span className="font-medium text-sm">
                                Mark as Featured
                            </span>
                        </label>
                    </div>
                </div>
            </FormSection>
        </FormWrapper>
    );
}
