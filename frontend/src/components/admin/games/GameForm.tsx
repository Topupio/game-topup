"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Game, Variant } from "@/lib/types/game";
import { GamePayload } from "@/services/games/types";
import { useAdminForm } from "@/hooks/useAdminForm";
import { gamesApiClient } from "@/services/games";
import { GAME_CATEGORY_OPTIONS } from "@/lib/constants/gameCategories";
import { CATEGORY_OPTIONS } from "@/lib/constants/checkoutTemplates";

import FormWrapper from "@/components/admin/form/FormWrapper";
import FormSection from "@/components/admin/form/FormSection";
import ImageUploader from "@/components/form/ImageUploader";
import StatusToggle from "@/components/form/StatusToggle";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import Textarea from "@/components/form/TextArea";
import RegionMultiSelect from "./RegionMultiSelect";
import VariantManager from "./VariantManager";

interface Props {
    gameId: string | "new";
}

type FormState = Game & { imageFile?: File | null };

export default function GameForm({ gameId }: Props) {
    const isEdit = gameId !== "new";

    const {
        form,
        updateForm,
        loading,
        errors,
        updateError,
        clearError,
        handleSubmit,
    } = useAdminForm<FormState>(
        {
            _id: "",
            name: "",
            slug: "",
            category: "",
            paymentCategory: "",
            topupType: "",
            description: "",
            imageUrl: null,
            status: "active",
            regions: ["global"],
            variants: [],
            metaTitle: "",
            metaDescription: "",
            imageFile: null,
        },
        {
            onSuccess: () => {
                toast.success(isEdit ? "Game updated successfully" : "Game created successfully");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to save game");
            },
            redirectPath: "/admin/games",
        }
    );

    const [variantImages, setVariantImages] = useState<Record<number, File>>({});

    // Load game data when editing
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const response = await gamesApiClient.get(gameId as string);
                updateForm((prev) => ({
                    ...prev,
                    ...response.data,
                    regions: response.data.regions || ["global"],
                    variants: response.data.variants || [],
                    imageFile: null,
                }));
            } catch (error) {
                console.error("Failed to load game", error);
                toast.error("Failed to load game data");
            }
        })();
    }, [isEdit, gameId, updateForm]);

    const validate = (): boolean => {
        let isValid = true;

        if (!form.name?.trim()) {
            updateError("name", "Game name is required");
            isValid = false;
        } else {
            clearError("name");
        }

        if (!form.category?.trim()) {
            updateError("category", "Category is required");
            isValid = false;
        } else {
            clearError("category");
        }

        if (!form.regions || form.regions.length === 0) {
            updateError("regions" as any, "At least one region is required");
            isValid = false;
        }

        for (let i = 0; i < form.variants.length; i++) {
            const v = form.variants[i];
            if (!v.name?.trim()) {
                toast.error(`Variant #${i + 1}: Name is required`);
                isValid = false;
                break;
            }
        }

        return isValid;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix validation errors");
            return;
        }

        await handleSubmit(async (formData) => {
            const payload: GamePayload = {
                name: formData.name,
                category: formData.category,
                paymentCategory: formData.paymentCategory || "",
                topupType: formData.topupType || "",
                description: formData.description,
                status: formData.status,
                regions: formData.regions,
                variants: formData.variants,
                variantImages: Object.keys(variantImages).length > 0 ? variantImages : undefined,
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                image: (formData.imageFile as File) ?? null,
            };

            if (isEdit) {
                await gamesApiClient.update(gameId as string, payload);
            } else {
                await gamesApiClient.create(payload);
            }
        }, e);
    };

    return (
        <FormWrapper
            title={isEdit ? "Update Game" : "Create New Game"}
            isEdit={isEdit}
            loading={loading}
            onSubmit={onSubmit}
            submitLabel={isEdit ? "Update Game" : "Create Game"}
        >
            {/* ── Section 1: Game Identity ── */}
            <FormSection title="Game Identity" description="Basic info about the game or app">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Image thumbnail */}
                    <div className="w-full md:w-48 shrink-0 [&_div.relative]:h-48">
                        <ImageUploader
                            imageUrl={form.imageUrl || null}
                            aspectRatio={1}
                            onChange={(file, preview) => {
                                updateForm({
                                    imageFile: file,
                                    imageUrl: preview,
                                });
                            }}
                        />
                    </div>

                    {/* Right: Fields */}
                    <div className="flex-1 space-y-4">
                        <Input
                            label="Game / App Name"
                            placeholder="e.g. Brawl Stars"
                            value={form.name}
                            required
                            error={errors.name}
                            onChange={(e) => {
                                updateForm({ name: e.target.value });
                                clearError("name");
                            }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Select
                                label="Category"
                                required
                                value={form.category}
                                error={errors.category}
                                onChange={(e) => {
                                    updateForm({ category: e.target.value });
                                    clearError("category");
                                }}
                                options={[
                                    { label: "Select category", value: "" },
                                    ...GAME_CATEGORY_OPTIONS,
                                ]}
                            />

                            <Select
                                label="Payment Category"
                                value={form.paymentCategory}
                                onChange={(e) => updateForm({ paymentCategory: e.target.value })}
                                options={[
                                    { label: "Select payment category", value: "" },
                                    ...CATEGORY_OPTIONS,
                                ]}
                            />

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Status
                                </label>
                                <div className="pt-1">
                                    <StatusToggle
                                        value={form.status}
                                        onChange={(status) => updateForm({ status })}
                                    />
                                </div>
                            </div>
                        </div>

                        <RegionMultiSelect
                            selectedRegions={form.regions}
                            onChange={(regions) => updateForm({ regions })}
                            error={(errors as any).regions}
                        />
                    </div>
                </div>
            </FormSection>

            {/* ── Section 2: Description ── */}
            <FormSection title="Description">
                <Textarea
                    placeholder="Describe the game, what it offers, delivery details..."
                    value={form.description}
                    onChange={(e) => {
                        updateForm({ description: e.target.value });
                    }}
                />
            </FormSection>

            {/* ── Section 3: Variants (core content) ── */}
            <FormSection
                title="Variants (Items / Packages)"
                description="Add in-game items or packages that customers can purchase"
            >
                <VariantManager
                    variants={form.variants}
                    regions={form.regions}
                    onChange={(variants) => updateForm({ variants })}
                    onVariantImageChange={(index, file) => {
                        setVariantImages((prev) => {
                            const next = { ...prev };
                            if (file) {
                                next[index] = file;
                            } else {
                                delete next[index];
                            }
                            return next;
                        });
                    }}
                />
            </FormSection>

            {/* ── Section 4: SEO ── */}
            <FormSection title="SEO" description="Optional search engine optimization fields">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Meta Title"
                        placeholder="SEO Title"
                        value={form.metaTitle}
                        onChange={(e) => updateForm({ metaTitle: e.target.value })}
                    />
                    <Input
                        label="Meta Description"
                        placeholder="SEO Description"
                        value={form.metaDescription}
                        onChange={(e) => updateForm({ metaDescription: e.target.value })}
                    />
                </div>
            </FormSection>
        </FormWrapper>
    );
}
