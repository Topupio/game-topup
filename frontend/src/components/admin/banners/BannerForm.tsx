"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Banner } from "@/services/banner/types";
import { bannerApiClient } from "@/services/banner/bannerApi.client";

import ImageUploader from "@/components/form/ImageUploader";
import StatusToggle from "@/components/form/StatusToggle";
import Input from "@/components/form/Input";
import SubmitButton from "@/components/ui/SubmitButton";

interface Props {
    bannerId: string | "new";
}

export default function BannerForm({ bannerId }: Props) {
    const router = useRouter();
    const isEdit = bannerId !== "new";

    const [form, setForm] = useState<Partial<Banner>>({
        title: "",
        link: "",
        imageUrl: "",
        isActive: true,
        order: 0,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        title: "",
        imageUrl: "",
    });

    /* ---------------- Load banner (edit) ---------------- */
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const res = await bannerApiClient.get(bannerId);
                const banner = res.data;

                setForm({
                    title: banner.title,
                    link: banner.link,
                    imageUrl: banner.imageUrl,
                    isActive: banner.isActive,
                    order: banner.order,
                });
            } catch (error) {
                console.error(error);
                toast.error("Failed to load banner");
                router.push("/admin/banners");
            }
        })();
    }, [isEdit, bannerId, router]);

    /* ---------------- Validation ---------------- */
    const validate = () => {
        const newErrors = { title: "", imageUrl: "" };
        let isValid = true;

        if (!isEdit && !imageFile && !form.imageUrl) {
            newErrors.imageUrl = "Image is required for new banner.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    /* ---------------- Submit ---------------- */
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        try {
            const payload = {
                title: form.title,
                link: form.link,
                isActive: String(form.isActive),
                order: String(form.order),
                image: imageFile ?? undefined,
            };

            if (isEdit) {
                await bannerApiClient.update(bannerId, payload);
                toast.success("Banner updated");
            } else {
                await bannerApiClient.create(payload);
                toast.success("Banner created");
            }

            router.push("/admin/banners");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save banner");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <form onSubmit={onSubmit} className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">
                {isEdit ? "Update Banner" : "Create Banner"}
            </h1>

            {/* Image */}
            <ImageUploader
                imageUrl={form.imageUrl || null}
                onChange={(file, preview) => {
                    setImageFile(file);
                    setForm((f) => ({ ...f, imageUrl: preview ?? undefined }));
                    setErrors((prev) => ({ ...prev, imageUrl: "" }));
                }}
                error={errors.imageUrl}
            />

            {/* Title */}
            <Input
                label="Title (Optional)"
                placeholder="Banner title"
                value={form.title || ""}
                onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                }
                error={errors.title}
            />

            {/* Link */}
            <Input
                label="Link URL (Optional)"
                placeholder="/games/some-game"
                value={form.link || ""}
                onChange={(e) =>
                    setForm((f) => ({ ...f, link: e.target.value }))
                }
            />

            {/* Order */}
            <Input
                label="Order (Sort Priority)"
                type="number"
                value={form.order ?? 0}
                onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) }))
                }
            />

            {/* Status */}
            <div>
                <label className="font-medium block mb-2">Status</label>
                <StatusToggle
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(val) =>
                        setForm((f) => ({
                            ...f,
                            isActive: val === "active",
                        }))
                    }
                />
            </div>

            <SubmitButton
                isLoading={loading}
                label={isEdit ? "Update Banner" : "Create Banner"}
            />
        </form>
    );
}
