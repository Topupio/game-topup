"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { TbPlus, TbTrash, TbArrowUp, TbArrowDown } from "react-icons/tb";
import { useAdminForm } from "@/hooks/useAdminForm";
import { blogApiClient } from "@/services/blog/blogApi.client";
import { BlogContentSection, BlogPayload } from "@/services/blog/types";

import FormWrapper from "@/components/admin/form/FormWrapper";
import FormSection from "@/components/admin/form/FormSection";
import ImageUploader from "@/components/form/ImageUploader";
import Input from "@/components/form/Input";
import Textarea from "@/components/form/TextArea";

interface Props {
    blogId: string | "new";
}

interface BlogFormData {
    title: string;
    slug: string;
    description: string;
    category: string;
    content: BlogContentSection[];
    seo: { metaTitle: string; metaDescription: string; keywords: string };
    coverImage: string | null;
    imageFile?: File | null;
}

export default function BlogForm({ blogId }: Props) {
    const isEdit = blogId !== "new";

    const {
        form,
        updateForm,
        loading,
        errors,
        updateError,
        clearError,
        handleSubmit,
    } = useAdminForm<BlogFormData>(
        {
            title: "",
            slug: "",
            description: "",
            category: "",
            content: [],
            seo: { metaTitle: "", metaDescription: "", keywords: "" },
            coverImage: null,
            imageFile: null,
        },
        {
            onSuccess: () => {
                toast.success(
                    isEdit ? "Blog updated successfully" : "Blog created successfully"
                );
            },
            onError: (error: any) => {
                toast.error(
                    error.response?.data?.message || "Failed to save blog"
                );
            },
            redirectPath: "/admin/blogs",
        }
    );

    // Load blog data
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const res = await blogApiClient.get(blogId);
                const blog = res.data;
                updateForm({
                    title: blog.title,
                    slug: blog.slug,
                    description: blog.description || "",
                    category: blog.category,
                    content: blog.content || [],
                    seo: {
                        metaTitle: blog.seo?.metaTitle || "",
                        metaDescription: blog.seo?.metaDescription || "",
                        keywords: blog.seo?.keywords?.join(", ") || "",
                    },
                    coverImage: blog.coverImage,
                    imageFile: null,
                });
            } catch (error) {
                console.error(error);
                toast.error("Failed to load blog");
            }
        })();
    }, [isEdit, blogId, updateForm]);

    const addSection = () => {
        updateForm((prev) => ({
            ...prev,
            content: [
                ...prev.content,
                { contentTitle: "", contentDescription: "" },
            ],
        }));
    };

    const removeSection = (index: number) => {
        updateForm((prev) => ({
            ...prev,
            content: prev.content.filter((_, i) => i !== index),
        }));
    };

    const updateSection = (
        index: number,
        field: keyof BlogContentSection,
        value: string
    ) => {
        updateForm((prev) => {
            const newContent = [...prev.content];
            newContent[index] = { ...newContent[index], [field]: value };
            return { ...prev, content: newContent };
        });
    };

    const moveSection = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === form.content.length - 1) return;

        updateForm((prev) => {
            const newContent = [...prev.content];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            [newContent[index], newContent[targetIndex]] = [
                newContent[targetIndex],
                newContent[index],
            ];
            return { ...prev, content: newContent };
        });
    };

    const validate = (): boolean => {
        clearError("title");
        clearError("category");

        let isValid = true;

        if (!form.title?.trim()) {
            updateError("title", "Title is required");
            isValid = false;
        }
        if (!form.category?.trim()) {
            updateError("category", "Category is required");
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
            const payload: BlogPayload = {
                title: formData.title,
                slug: formData.slug,
                description: formData.description,
                category: formData.category,
                content: formData.content,
                seo: {
                    metaTitle: formData.seo.metaTitle,
                    metaDescription: formData.seo.metaDescription,
                    keywords: formData.seo.keywords
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean),
                },
                coverImage: formData.imageFile || undefined,
            };

            if (isEdit) {
                await blogApiClient.update(blogId, payload);
            } else {
                await blogApiClient.create(payload);
            }
        }, e);
    };

    return (
        <FormWrapper
            title={isEdit ? "Update Blog" : "Create New Blog"}
            isEdit={isEdit}
            loading={loading}
            onSubmit={onSubmit}
            submitLabel={isEdit ? "Update Blog" : "Create Blog"}
        >
            {/* Basic Info */}
            <FormSection title="Basic Information">
                <ImageUploader
                    imageUrl={form.coverImage}
                    onChange={(file, preview) => {
                        updateForm({
                            imageFile: file,
                            coverImage: preview,
                        });
                    }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Title"
                        value={form.title}
                        onChange={(e) => {
                            updateForm({ title: e.target.value });
                            clearError("title");
                        }}
                        required
                        error={errors.title}
                        placeholder="Blog Title"
                    />
                    <Input
                        label="Slug (URL Friendly)"
                        value={form.slug}
                        onChange={(e) => updateForm({ slug: e.target.value })}
                        required
                        placeholder="my-blog-post"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Category"
                        value={form.category}
                        onChange={(e) => {
                            updateForm({ category: e.target.value });
                            clearError("category");
                        }}
                        required
                        error={errors.category}
                        placeholder="News, Updates, Guide"
                    />
                    <Textarea
                        label="Short Description"
                        value={form.description}
                        onChange={(e) =>
                            updateForm({ description: e.target.value })
                        }
                        placeholder="Brief summary of the blog post"
                    />
                </div>
            </FormSection>

            {/* Content Sections */}
            <FormSection title="Content Sections">
                <div className="flex justify-between items-center mb-4">
                    <button
                        type="button"
                        onClick={addSection}
                        className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition"
                    >
                        <TbPlus /> Add Section
                    </button>
                </div>

                <div className="space-y-4">
                    {form.content.map((section, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group"
                        >
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => moveSection(index, "up")}
                                    className="p-1.5 text-gray-500 hover:bg-white rounded"
                                    disabled={index === 0}
                                >
                                    <TbArrowUp />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveSection(index, "down")}
                                    className="p-1.5 text-gray-500 hover:bg-white rounded"
                                    disabled={index === form.content.length - 1}
                                >
                                    <TbArrowDown />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeSection(index)}
                                    className="p-1.5 text-red-500 hover:bg-white rounded"
                                >
                                    <TbTrash />
                                </button>
                            </div>

                            <div className="space-y-3 pr-10">
                                <Input
                                    label={`Section ${index + 1} Title`}
                                    value={section.contentTitle}
                                    onChange={(e) =>
                                        updateSection(
                                            index,
                                            "contentTitle",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Section Header"
                                />
                                <Textarea
                                    label="Content Body"
                                    value={section.contentDescription}
                                    onChange={(e) =>
                                        updateSection(
                                            index,
                                            "contentDescription",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Write section content here..."
                                />
                            </div>
                        </div>
                    ))}

                    {form.content.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                            No content sections yet. Click "Add Section" to add
                            one.
                        </div>
                    )}
                </div>
            </FormSection>

            {/* SEO Settings */}
            <FormSection title="SEO Settings" divider={false}>
                <Input
                    label="Meta Title"
                    value={form.seo.metaTitle}
                    onChange={(e) =>
                        updateForm({
                            seo: { ...form.seo, metaTitle: e.target.value },
                        })
                    }
                    placeholder="SEO Title"
                />
                <Textarea
                    label="Meta Description"
                    value={form.seo.metaDescription}
                    onChange={(e) =>
                        updateForm({
                            seo: {
                                ...form.seo,
                                metaDescription: e.target.value,
                            },
                        })
                    }
                    placeholder="SEO Description"
                />
                <Input
                    label="Keywords (comma separated)"
                    value={form.seo.keywords}
                    onChange={(e) =>
                        updateForm({ seo: { ...form.seo, keywords: e.target.value } })
                    }
                    placeholder="game, topup, guide"
                />
            </FormSection>
        </FormWrapper>
    );
}
