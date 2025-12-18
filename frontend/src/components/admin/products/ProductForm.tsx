"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Product, ProductPayload } from "@/lib/types/product";
import { productsApiClient } from "@/services/products";

import Input from "@/components/form/Input";
import ImageUploader from "@/components/form/ImageUploader";
import StatusToggle from "@/components/form/StatusToggle";
import Textarea from "@/components/form/TextArea";
import SubmitButton from "@/components/ui/SubmitButton";

interface ProductFormProps {
    slug: string | "new";
}

export default function ProductForm({ slug }: ProductFormProps) {
    const router = useRouter();
    const isEdit = slug !== "new";

    const [form, setForm] = useState<Product>({
        _id: "",
        gameId: "",
        name: "",
        slug: "",
        description: "",
        image: null,
        price: 0,
        discountedPrice: 0,
        deliveryTime: "Instant Delivery",
        status: "active",
        isPopular: false,
        metaTitle: "",
        metaDescription: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        name: "",
        slug: "",
        price: "",
        discountedPrice: "",
        gameId: "",
    });

    // Load product on edit
    useEffect(() => {
        let mounted = true;
        if (isEdit) {
            (async () => {
                try {
                    const res = await productsApiClient.get(slug as string);
                    if (mounted) setForm(res);
                } catch (e) {
                    console.error(e);
                    toast.error("Failed to load product");
                }
            })();
        }
        return () => {
            mounted = false;
        };
    }, [slug, isEdit]);

    // VALIDATION
    const validate = () => {
        const newErr: any = {
            name: "",
            slug: "",
            price: "",
            discountedPrice: "",
            gameId: "",
        };

        if (!form.name.trim()) newErr.name = "Product name is required";
        if (!form.slug.trim()) newErr.slug = "Slug is required";
        if (!form.gameId) newErr.gameId = "Game selection is required";

        if (form.price <= 0) newErr.price = "Price must be greater than 0";

        if (form.discountedPrice < 0)
            newErr.discountedPrice = "Invalid discounted price";
        else if (form.discountedPrice > form.price)
            newErr.discountedPrice = "Discount cannot exceed price";

        setErrors(newErr);

        return Object.values(newErr).every((v) => v === "");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Fix the validation errors");
            return;
        }

        setLoading(true);

        try {
            const payload: ProductPayload = {
                gameId: form.gameId,
                name: form.name,
                slug: form.slug,
                description: form.description,
                price: form.price,
                discountedPrice: form.discountedPrice,
                deliveryTime: form.deliveryTime,
                status: form.status,
                isPopular: form.isPopular,
                metaTitle: form.metaTitle,
                metaDescription: form.metaDescription,
                image: imageFile ?? null,
            };

            if (isEdit) {
                await productsApiClient.update(slug as string, payload);
                toast.success("Product updated");
            } else {
                await productsApiClient.create(payload);
                toast.success("Product created");
            }

            router.push("/admin/products");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">
                {isEdit ? "Update Product" : "Create Product"}
            </h1>

            {/* IMAGE UPLOAD */}
            <ImageUploader
                imageUrl={form.imageUrl || null}
                aspectRatio={1}
                onChange={(file, preview) => {
                    setImageFile(file);
                    setForm((f) => ({ ...f, image: preview }));
                }}
            />

            {/* Game ID */}
            <Input
                label="Game ID"
                placeholder="Select or enter a Game ID"
                value={form.gameId}
                error={errors.gameId}
                required
                onChange={(e) =>
                    setForm({ ...form, gameId: e.target.value })
                }
            />

            {/* Name */}
            <Input
                label="Product Name"
                placeholder="Enter product name"
                value={form.name}
                error={errors.name}
                required
                onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                }
            />

            {/* Slug */}
            <Input
                label="Slug"
                placeholder="unique-product-slug"
                value={form.slug}
                error={errors.slug}
                required
                onChange={(e) =>
                    setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
            />

            {/* Description */}
            <Textarea
                label="Description"
                placeholder="Enter description"
                value={form.description}
                onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                }
            />

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Price"
                    type="number"
                    value={form.price}
                    error={errors.price}
                    required
                    onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                    }
                />

                <Input
                    label="Discounted Price"
                    type="number"
                    value={form.discountedPrice}
                    error={errors.discountedPrice}
                    required
                    onChange={(e) =>
                        setForm({ ...form, discountedPrice: Number(e.target.value) })
                    }
                />
            </div>

            <Input
                label="Delivery Time"
                value={form.deliveryTime}
                onChange={(e) =>
                    setForm({ ...form, deliveryTime: e.target.value })
                }
            />

            {/* Status */}
            <div>
                <label className="font-medium">Status</label>
                <StatusToggle
                    value={form.status}
                    onChange={(s) => setForm({ ...form, status: s })}
                />
            </div>

            {/* Popular toggle */}
            <div className="flex items-center gap-2">
                <label className="font-medium">Popular Product?</label>
                <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) =>
                        setForm({ ...form, isPopular: e.target.checked })
                    }
                />
            </div>

            {/* SEO Fields */}
            <Input
                label="Meta Title"
                value={form.metaTitle}
                onChange={(e) =>
                    setForm({ ...form, metaTitle: e.target.value })
                }
            />

            <Textarea
                label="Meta Description"
                value={form.metaDescription}
                onChange={(e) =>
                    setForm({ ...form, metaDescription: e.target.value })
                }
            />

            <SubmitButton
                isLoading={loading}
                label={isEdit ? "Update Product" : "Create Product"}
            />
        </form>
    );
}