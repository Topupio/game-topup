"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { TbPlus, TbTrash, TbArrowUp, TbArrowDown } from "react-icons/tb";
import { blogApiClient } from "@/services/blog/blogApi.client";
import { BlogContentSection, BlogPayload } from "@/services/blog/types";
import ImageUploader from "@/components/form/ImageUploader";
import Input from "@/components/form/Input";
import Textarea from "@/components/form/TextArea";
import SubmitButton from "@/components/ui/SubmitButton";

interface Props {
    blogId: string | "new";
}

export default function BlogForm({ blogId }: Props) {
    const router = useRouter();
    const isEdit = blogId !== "new";
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState<{
        title: string;
        slug: string;
        description: string;
        category: string;
        content: BlogContentSection[];
        seo: { metaTitle: string; metaDescription: string; keywords: string };
        coverImage: string | null;
    }>({
        title: "",
        slug: "",
        description: "",
        category: "",
        content: [],
        seo: { metaTitle: "", metaDescription: "", keywords: "" },
        coverImage: null,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    // Load Data
    useEffect(() => {
        if (isEdit) {
            (async () => {
                try {
                    const res = await blogApiClient.get(blogId);
                    const blog = res.data;
                    setForm({
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
                    });
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to load blog");
                    router.push("/admin/blogs");
                }
            })();
        }
    }, [isEdit, blogId, router]);

    // Handlers
    const addSection = () => {
        setForm(prev => ({
            ...prev,
            content: [...prev.content, { contentTitle: "", contentDescription: "" }]
        }));
    };

    const removeSection = (index: number) => {
        setForm(prev => ({
            ...prev,
            content: prev.content.filter((_, i) => i !== index)
        }));
    };

    const updateSection = (index: number, field: keyof BlogContentSection, value: string) => {
        setForm(prev => {
            const newContent = [...prev.content];
            newContent[index] = { ...newContent[index], [field]: value };
            return { ...prev, content: newContent };
        });
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === form.content.length - 1) return;

        setForm(prev => {
            const newContent = [...prev.content];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
            return { ...prev, content: newContent };
        });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.category) {
            toast.error("Title and Category are required");
            return;
        }

        setLoading(true);
        try {
            const payload: BlogPayload = {
                title: form.title,
                slug: form.slug,
                description: form.description,
                category: form.category,
                content: form.content,
                seo: {
                    metaTitle: form.seo.metaTitle,
                    metaDescription: form.seo.metaDescription,
                    keywords: form.seo.keywords.split(",").map(k => k.trim()).filter(Boolean),
                },
                coverImage: imageFile || undefined,
            };

            if (isEdit) {
                await blogApiClient.update(blogId, payload);
                toast.success("Blog updated successfully");
            } else {
                await blogApiClient.create(payload);
                toast.success("Blog created successfully");
            }
            router.push("/admin/blogs");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save blog");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="p-6 max-w-4xl mx-auto space-y-8 bg-white rounded-xl shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">
                {isEdit ? "Update Blog" : "Create New Blog"}
            </h1>

            {/* Basic Info */}
            <div className="space-y-6">
                <ImageUploader
                    imageUrl={form.coverImage}
                    onChange={(file, preview) => {
                        setImageFile(file);
                        if (preview) setForm(prev => ({ ...prev, coverImage: preview }));
                    }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Title"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        required
                        placeholder="Blog Title"
                    />
                    <Input
                        label="Slug (URL Friendly)"
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        required
                        placeholder="my-blog-post"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Category"
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        required
                        placeholder="News, Updates, Guide"
                    />
                    <Textarea
                        label="Short Description"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Brief summary of the blog post"
                    />
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Content Sections */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Content Sections</h2>
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
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => moveSection(index, 'up')} className="p-1.5 text-gray-500 hover:bg-white rounded" disabled={index === 0}><TbArrowUp /></button>
                                <button type="button" onClick={() => moveSection(index, 'down')} className="p-1.5 text-gray-500 hover:bg-white rounded" disabled={index === form.content.length - 1}><TbArrowDown /></button>
                                <button type="button" onClick={() => removeSection(index)} className="p-1.5 text-red-500 hover:bg-white rounded"><TbTrash /></button>
                            </div>

                            <div className="space-y-3 pr-10">
                                <Input
                                    label={`Section ${index + 1} Title`}
                                    value={section.contentTitle}
                                    onChange={e => updateSection(index, 'contentTitle', e.target.value)}
                                    placeholder="Section Header"
                                />
                                <Textarea
                                    label="Content Body"
                                    value={section.contentDescription}
                                    onChange={e => updateSection(index, 'contentDescription', e.target.value)}
                                    placeholder="Write section content here..."
                                />
                            </div>
                        </div>
                    ))}

                    {form.content.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                            No content sections yet. Click "Add Section" to add one.
                        </div>
                    )}
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* SEO Settings */}
            <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">SEO Settings</h2>
                <Input
                    label="Meta Title"
                    value={form.seo.metaTitle}
                    onChange={e => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
                    placeholder="SEO Title"
                />
                <Textarea
                    label="Meta Description"
                    value={form.seo.metaDescription}
                    onChange={e => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
                    placeholder="SEO Description"
                />
                <Input
                    label="Keywords (comma separated)"
                    value={form.seo.keywords}
                    onChange={e => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value } })}
                    placeholder="game, topup, guide"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                    Cancel
                </button>
                <SubmitButton isLoading={loading} label={isEdit ? "Update Blog" : "Create Blog"} />
            </div>
        </form>
    );
}
