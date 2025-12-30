"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { Game } from "@/lib/types/game";
import { GamePayload } from "@/services/games/types";
import { useAdminForm } from "@/hooks/useAdminForm";
import { gamesApiClient } from "@/services/games";

import FormWrapper from "@/components/admin/form/FormWrapper";
import FormSection from "@/components/admin/form/FormSection";
import ImageUploader from "@/components/form/ImageUploader";
import RequiredFieldsBuilder from "./RequiredFieldsBuilder";
import StatusToggle from "@/components/form/StatusToggle";
import Input from "@/components/form/Input";
import Textarea from "@/components/form/TextArea";

interface Props {
    gameId: string | "new";
}

export default function GameForm({ gameId }: Props) {
    const isEdit = gameId !== "new";

    const {
        form,
        updateForm,
        loading,
        setLoading,
        errors,
        updateError,
        clearError,
        handleSubmit,
    } = useAdminForm<Game & { imageFile?: File | null }>(
        {
            _id: "",
            name: "",
            slug: "",
            category: "",
            topupType: "",
            description: "",
            imageUrl: null,
            status: "active",
            requiredFields: [],
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

    // Load game data when editing
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const response = await gamesApiClient.get(gameId as string);
                updateForm((prev) => ({
                    ...prev,
                    ...response.data,
                    imageFile: null,
                }));
            } catch (error) {
                console.error("Failed to load game", error);
                toast.error("Failed to load game data");
            }
        })();
    }, [isEdit, gameId, updateForm]);

    const validate = (): boolean => {
        clearError("name");
        clearError("category");
        clearError("description");

        let isValid = true;

        if (!form.name?.trim()) {
            updateError("name", "Game name is required");
            isValid = false;
        }
        if (!form.category?.trim()) {
            updateError("category", "Category is required");
            isValid = false;
        }
        if (!form.topupType?.trim()) {
            updateError("topupType", "Top-up type is required");
            isValid = false;
        }
        if (!form.description?.trim()) {
            updateError("description", "Description is required");
            isValid = false;
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
                topupType: formData.topupType,
                description: formData.description,
                status: formData.status,
                requiredFields: formData.requiredFields,
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
            {/* Basic Info Section */}
            <FormSection title="Basic Information">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Game Name"
                        placeholder="Enter game name"
                        value={form.name}
                        required
                        error={errors.name}
                        onChange={(e) => {
                            updateForm({ name: e.target.value });
                            clearError("name");
                        }}
                    />

                    <Input
                        label="Category"
                        placeholder="Enter category"
                        value={form.category}
                        required
                        error={errors.category}
                        onChange={(e) => {
                            updateForm({ category: e.target.value });
                            clearError("category");
                        }}
                    />

                    <Input
                        label="Top-up Type"
                        placeholder="e.g. ID Top-up, ID Recharge"
                        value={form.topupType}
                        required
                        error={errors.topupType}
                        onChange={(e) => {
                            updateForm({ topupType: e.target.value });
                            clearError("topupType");
                        }}
                    />
                </div>

                <Textarea
                    label="Description"
                    placeholder="Enter description"
                    value={form.description}
                    required
                    error={errors.description}
                    onChange={(e) => {
                        updateForm({ description: e.target.value });
                        clearError("description");
                    }}
                />
            </FormSection>

            {/* Settings Section */}
            <FormSection title="Settings">
                <div>
                    <label className="font-medium block mb-2">Status</label>
                    <StatusToggle
                        value={form.status}
                        onChange={(status) => updateForm({ status })}
                    />
                </div>
            </FormSection>

            {/* Required Fields Section */}
            <FormSection title="Required Fields" divider={false}>
                <RequiredFieldsBuilder
                    fields={form.requiredFields}
                    onChange={(fields) =>
                        updateForm({ requiredFields: fields })
                    }
                    errors={Array.isArray(errors.requiredFields) ? (errors.requiredFields as any) : undefined}
                />
            </FormSection>

            {/* SEO Settings Section */}
            <FormSection title="SEO Settings">
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
                />
            </FormSection>
        </FormWrapper>
    );
}