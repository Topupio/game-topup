"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Game, Variant } from "@/lib/types/game";
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
import RichTextEditor from "@/components/form/RichTextEditor";
import VariantManager from "./VariantManager";
import CheckoutTemplateSelector from "./CheckoutTemplateSelector";

interface Props {
    gameId: string | "new";
}

type FormState = Game & { imageFile?: File | null };

function getCanonicalPricing(variant: Variant) {
    return variant.regionPricing?.find((p) => p.region === "global") || variant.regionPricing?.[0];
}

function normalizeVariantPricing(variant: Variant): Variant {
    const pricing = getCanonicalPricing(variant);

    return {
        ...variant,
        regionPricing: [{
            region: "global",
            currency: "USD",
            symbol: "$",
            price: pricing?.price ?? 0,
            discountedPrice: pricing?.discountedPrice ?? 0,
        }],
    };
}

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
        isDirty,
        resetBaseline,
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
            showOnHomepage: false,
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
            onError: (error: unknown) => {
                const apiError = error as { response?: { data?: { message?: string } } };
                toast.error(apiError.response?.data?.message || "Failed to save game");
            },
            redirectPath: "/admin/games",
        }
    );

    const [variantImages, setVariantImages] = useState<Record<number, File>>({});

    /*
     * Picked-but-not-uploaded images live outside the form object, and File
     * objects don't survive the JSON comparison the hook uses (they stringify to
     * {}). So track them separately and OR them into the dirty check, otherwise
     * an admin who only swapped an image would find Save greyed out.
     */
    const hasPendingImages = Object.keys(variantImages).length > 0 || form.imageFile !== null;
    const hasUnsavedChanges = isDirty || hasPendingImages;

    /*
     * Images the admin has picked but not saved yet live in `variantImages`,
     * keyed by the variant's position in the array — the upload is sent as
     * `variantImage_<index>` and the backend attaches it to `variants[index]`.
     *
     * That means dragging a variant to a new position would leave its pending
     * image behind on whatever variant now sits at the old index. So when the
     * variants array is reordered, we perform the same move on the image keys.
     *
     * Done by laying the images out as a plain array (one slot per variant,
     * `undefined` where there's no pending image), moving one slot the same way
     * the variant moved, then turning it back into an index-keyed object.
     */
    const handleVariantsReorder = (from: number, to: number) => {
        setVariantImages((previousImages) => {
            const slotCount = form.variants.length;

            // 1. Object -> array, so index 2 of the array is the image for variant 2.
            const slots: (File | undefined)[] = Array.from(
                { length: slotCount },
                (_, index) => previousImages[index]
            );

            // 2. Pull the dragged variant's slot out and re-insert it at its new position.
            const [movedSlot] = slots.splice(from, 1);
            slots.splice(to, 0, movedSlot);

            // 3. Array -> object, skipping the slots that have no pending image.
            const nextImages: Record<number, File> = {};
            slots.forEach((file, index) => {
                if (file) nextImages[index] = file;
            });
            return nextImages;
        });
    };

    // Load game data when editing
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const response = await gamesApiClient.get(gameId as string, {
                    includeInactive: true,
                });
                updateForm((prev) => {
                    const loaded = {
                        ...prev,
                        ...response.data,
                        regions: ["global"],
                        variants: (response.data.variants || []).map(normalizeVariantPricing),
                        faqs: response.data.faqs || [],
                        imageFile: null,
                    };
                    // Everything just fetched matches the server, so this is the
                    // state we compare against to decide if there are edits.
                    resetBaseline(loaded);
                    return loaded;
                });
            } catch (error) {
                console.error("Failed to load game", error);
                toast.error("Failed to load game data");
            }
        })();
    }, [isEdit, gameId, updateForm, resetBaseline]);

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

        for (let i = 0; i < form.variants.length; i++) {
            const v = form.variants[i];
            if (!v.name?.trim()) {
                toast.error(`Variant #${i + 1}: Name is required`);
                isValid = false;
                break;
            }

            const pricing = getCanonicalPricing(v);
            if (pricing && pricing.discountedPrice > pricing.price) {
                toast.error(`Variant #${i + 1}: Selling price cannot exceed original price`);
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
                showOnHomepage: formData.showOnHomepage,
                regions: ["global"],
                checkoutTemplate: formData.checkoutTemplate,
                checkoutTemplateOptions: formData.checkoutTemplateOptions,
                variants: formData.variants.map(normalizeVariantPricing),
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
            isDirty={hasUnsavedChanges}
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
                                <span className="text-sm font-medium text-gray-700 block mb-1">
                                    Status
                                </span>
                                <div className="pt-1">
                                    <StatusToggle
                                        value={form.status}
                                        onChange={(status) => updateForm({ status })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-700 block mb-2">
                                Homepage Placement
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                                        ${form.isPopular
                                            ? "border-amber-300 bg-amber-50/70"
                                            : "border-gray-200 bg-gray-50/50 hover:border-gray-300"}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.isPopular}
                                        onChange={(e) => updateForm({ isPopular: e.target.checked })}
                                        className="mt-0.5 w-4 h-4 shrink-0 rounded text-amber-500 focus:ring-amber-200"
                                    />
                                    <span className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-gray-700">
                                            Mark as popular
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Adds this game to the separate “Popular Digital Services” row.
                                        </span>
                                    </span>
                                </label>

                                <label
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                                        ${form.showOnHomepage
                                            ? "border-amber-300 bg-amber-50/70"
                                            : "border-gray-200 bg-gray-50/50 hover:border-gray-300"}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.showOnHomepage}
                                        onChange={(e) => updateForm({ showOnHomepage: e.target.checked })}
                                        className="mt-0.5 w-4 h-4 shrink-0 rounded text-amber-500 focus:ring-amber-200"
                                    />
                                    <span className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-gray-700">
                                            Show in home page
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Shows this game first in its category row on the home page.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>

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
                    onVariantsReorder={handleVariantsReorder}
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
