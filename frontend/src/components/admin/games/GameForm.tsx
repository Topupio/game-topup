"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Game, Variant, FaqItem } from "@/lib/types/game";
import { GamePayload } from "@/services/games/types";
import { RiAddLine, RiDeleteBin6Line } from "react-icons/ri";
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
import RichTextEditor from "@/components/form/RichTextEditor";
import VariantManager from "./VariantManager";
import CheckoutTemplateSelector from "./CheckoutTemplateSelector";

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
            richDescription: "",
            imageUrl: null,
            status: "active",
            isPopular: false,
            regions: ["global"],
            checkoutTemplate: "",
            checkoutTemplateOptions: {},
            variants: [],
            faqs: [],
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
                    faqs: response.data.faqs || [],
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

        if (isEdit && !form.slug?.trim()) {
            updateError("slug", "Slug is required");
            isValid = false;
        } else if (form.slug?.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
            updateError("slug", "Slug must be lowercase letters, numbers, and hyphens (e.g. brawl-stars)");
            isValid = false;
        } else {
            clearError("slug");
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
                slug: formData.slug || undefined,
                category: formData.category,
                paymentCategory: formData.paymentCategory || "",
                topupType: formData.topupType || "",
                description: formData.description,
                richDescription: formData.richDescription,
                status: formData.status,
                isPopular: formData.isPopular,
                regions: formData.regions,
                checkoutTemplate: formData.checkoutTemplate,
                checkoutTemplateOptions: formData.checkoutTemplateOptions,
                variants: formData.variants,
                variantImages: Object.keys(variantImages).length > 0 ? variantImages : undefined,
                faqs: (formData.faqs || []).filter(f => f.question.trim() && f.answer.trim()),
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                            <Input
                                label="URL Slug"
                                placeholder="e.g. brawl-stars"
                                value={form.slug}
                                required={isEdit}
                                error={errors.slug}
                                helperText={isEdit ? "Lowercase letters, numbers, and hyphens only. This determines the game's URL." : "Leave empty to auto-generate from name"}
                                onChange={(e) => {
                                    const sanitized = e.target.value
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                        .replace(/[^a-z0-9-]/g, "")
                                        .replace(/-{2,}/g, "-");
                                    updateForm({ slug: sanitized });
                                    clearError("slug");
                                }}
                            />
                        </div>

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

                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isPopular}
                                onChange={(e) => updateForm({ isPopular: e.target.checked })}
                                className="rounded text-amber-500 focus:ring-amber-200"
                            />
                            <span className="text-xs text-gray-500">Mark as popular</span>
                        </label>

                        <RegionMultiSelect
                            selectedRegions={form.regions}
                            onChange={(regions) => updateForm({ regions })}
                            error={(errors as any).regions}
                        />
                    </div>
                </div>
            </FormSection>

            {/* ── Section 2: Checkout Configuration ── */}
            <FormSection title="Checkout Configuration" description="Template and options for the checkout form">
                <CheckoutTemplateSelector
                    selectedTemplate={form.checkoutTemplate || ""}
                    templateOptions={form.checkoutTemplateOptions || {}}
                    onTemplateChange={(checkoutTemplate) => updateForm({ checkoutTemplate })}
                    onOptionsChange={(checkoutTemplateOptions) => updateForm({ checkoutTemplateOptions })}
                />
            </FormSection>

            {/* ── Section 3: Mini Description ── */}
            <FormSection title="Mini Description" description="A short 1-2 line summary">
                <Textarea
                    placeholder="Brief summary of the game and what it offers..."
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
                    checkoutTemplate={form.checkoutTemplate || ""}
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

            {/* ── Section 4: Description (Rich Text) ── */}
            <FormSection
                title="Description"
                description="Detailed description with formatting and images (e.g., how to top-up steps)"
            >
                <RichTextEditor
                    value={form.richDescription}
                    onChange={(html) => updateForm({ richDescription: html })}
                    placeholder="Write a detailed description, instructions, or how-to-topup steps..."
                />
            </FormSection>

            {/* ── Section 5: SEO ── */}
            <FormSection title="SEO" description="Optional search engine optimization fields">
                <div className="space-y-4">
                    <Input
                        label="Meta Title"
                        placeholder="SEO Title"
                        value={form.metaTitle}
                        onChange={(e) => updateForm({ metaTitle: e.target.value })}
                    />
                    <Textarea
                        label="Meta Description"
                        placeholder="SEO Description"
                        value={form.metaDescription}
                        onChange={(e) => updateForm({ metaDescription: e.target.value })}
                        className="min-h-[80px]"
                    />
                </div>
            </FormSection>

            {/* ── Section 6: FAQs ── */}
            <FormSection title="FAQs" description="Frequently asked questions displayed on the game page">
                <div className="space-y-4">
                    {(form.faqs || []).map((faq, index) => (
                        <div
                            key={index}
                            className="relative border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = [...(form.faqs || [])];
                                    updated.splice(index, 1);
                                    updateForm({ faqs: updated });
                                }}
                                className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove FAQ"
                            >
                                <RiDeleteBin6Line className="w-4 h-4" />
                            </button>

                            <Input
                                label={`Question ${index + 1}`}
                                placeholder="e.g. How do I top up?"
                                value={faq.question}
                                onChange={(e) => {
                                    const updated = [...(form.faqs || [])];
                                    updated[index] = { ...updated[index], question: e.target.value };
                                    updateForm({ faqs: updated });
                                }}
                            />
                            <Textarea
                                label="Answer"
                                placeholder="Write the answer..."
                                value={faq.answer}
                                onChange={(e) => {
                                    const updated = [...(form.faqs || [])];
                                    updated[index] = { ...updated[index], answer: e.target.value };
                                    updateForm({ faqs: updated });
                                }}
                                className="min-h-[80px]"
                            />
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => {
                            updateForm({
                                faqs: [...(form.faqs || []), { question: "", answer: "" }],
                            });
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                    >
                        <RiAddLine className="w-4 h-4" />
                        Add FAQ
                    </button>
                </div>
            </FormSection>
        </FormWrapper>
    );
}
