"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

import { Banner } from "@/services/banner/types";
import { bannerApiClient } from "@/services/banner/bannerApi.client";
import { useAdminForm } from "@/hooks/useAdminForm";

import FormWrapper from "@/components/admin/form/FormWrapper";
import FormSection from "@/components/admin/form/FormSection";
import ImageUploader from "@/components/form/ImageUploader";
import StatusToggle from "@/components/form/StatusToggle";
import Input from "@/components/form/Input";

interface Props {
    bannerId: string | "new";
}

interface BannerFormData extends Partial<Banner> {
    imageFile?: File | null;
}

export default function BannerForm({ bannerId }: Props) {
    const isEdit = bannerId !== "new";

    const {
        form,
        updateForm,
        loading,
        errors,
        updateError,
        clearError,
        handleSubmit,
    } = useAdminForm<BannerFormData>(
        {
            title: "",
            link: "",
            imageUrl: "",
            isActive: true,
            order: 0,
            imageFile: null,
        },
        {
            onSuccess: () => {
                toast.success(
                    isEdit ? "Banner updated successfully" : "Banner created successfully"
                );
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to save banner");
            },
            redirectPath: "/admin/banners",
            refreshAfterSubmit: true,
        }
    );

    /* Load banner (edit) */
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const res = await bannerApiClient.get(bannerId);
                const banner = res.data;

                updateForm({
                    title: banner.title,
                    link: banner.link,
                    imageUrl: banner.imageUrl,
                    isActive: banner.isActive,
                    order: banner.order,
                    imageFile: null,
                });
            } catch (error) {
                console.error(error);
                toast.error("Failed to load banner");
            }
        })();
    }, [isEdit, bannerId, updateForm]);

    /* Validation */
    const validate = (): boolean => {
        if (!isEdit && !form.imageFile && !form.imageUrl) {
            updateError("imageUrl", "Image is required");
            return false;
        }
        return true;
    };

    /* Submit */
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix validation errors");
            return;
        }

        await handleSubmit(async (formData) => {
            const payload = {
                title: formData.title,
                link: formData.link,
                isActive: String(formData.isActive),
                order: String(formData.order),
                image: (formData.imageFile as File) ?? undefined,
            };

            if (isEdit) {
                await bannerApiClient.update(bannerId, payload);
            } else {
                await bannerApiClient.create(payload);
            }
        }, e);
    };

    return (
        <FormWrapper
            title={isEdit ? "Update Banner" : "Create Banner"}
            isEdit={isEdit}
            loading={loading}
            onSubmit={onSubmit}
            submitLabel={isEdit ? "Update Banner" : "Create Banner"}
        >
            <FormSection title="Banner Information">
                <ImageUploader
                    imageUrl={(form.imageUrl as string | null) || null}
                    onChange={(file, preview) => {
                        updateForm({
                            imageFile: file,
                            imageUrl: preview ?? undefined,
                        });
                        clearError("imageUrl");
                    }}
                    error={errors.imageUrl}
                />

                <Input
                    label="Title (Optional)"
                    placeholder="Banner title"
                    value={(form.title as string) || ""}
                    onChange={(e) => updateForm({ title: e.target.value })}
                    error={errors.title}
                />

                <Input
                    label="Link URL (Optional)"
                    placeholder="game-name"
                    value={(form.link as string) || ""}
                    onChange={(e) => updateForm({ link: e.target.value })}
                />

                <Input
                    label="Order (Sort Priority)"
                    type="number"
                    value={(form.order as number) ?? 0}
                    onChange={(e) =>
                        updateForm({ order: Number(e.target.value) })
                    }
                />
            </FormSection>

            <FormSection title="Settings" divider={false}>
                <div>
                    <label className="font-medium block mb-2">Status</label>
                    <StatusToggle
                        value={(form.isActive ? "active" : "inactive") as any}
                        onChange={(val) =>
                            updateForm({ isActive: val === "active" })
                        }
                    />
                </div>
            </FormSection>
        </FormWrapper>
    );
}
