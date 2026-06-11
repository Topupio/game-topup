"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { TbPlus, TbTrash, TbArrowUp, TbArrowDown, TbChevronDown, TbSearch, TbX } from "react-icons/tb";
import { useAdminForm } from "@/hooks/useAdminForm";
import { blogApiClient } from "@/services/blog/blogApi.client";
import { BlogContentSection, BlogPayload, RelatedBlogGame } from "@/services/blog/types";
import { gamesApiClient } from "@/services/games";
import { Game } from "@/lib/types/game";

import FormWrapper from "@/components/admin/form/FormWrapper";
import FormSection from "@/components/admin/form/FormSection";
import ImageUploader from "@/components/form/ImageUploader";
import Input from "@/components/form/Input";
import Textarea from "@/components/form/TextArea";
import RichTextEditor from "@/components/form/RichTextEditor";

interface Props {
    blogId: string | "new";
}

interface BlogFormData {
    title: string;
    slug: string;
    description: string;
    category: string;
    relatedGames: string[];
    content: BlogContentSection[];
    seo: { metaTitle: string; metaDescription: string; keywords: string };
    coverImage: string | null;
    imageFile?: File | null;
}

const toRelatedGameIds = (relatedGames: Array<string | RelatedBlogGame> | undefined) => {
    if (!relatedGames) return [];
    return relatedGames.map((game) => typeof game === "string" ? game : game._id);
};

const toPopulatedGames = (relatedGames: Array<string | RelatedBlogGame> | undefined) => {
    if (!relatedGames) return [];
    return relatedGames.filter((game): game is RelatedBlogGame => typeof game === "object");
};

const normalizeRelatedGame = (game: RelatedBlogGame): Game => ({
    _id: game._id,
    name: game.name,
    slug: game.slug,
    category: game.category,
    paymentCategory: game.paymentCategory || game.category,
    topupType: "",
    imageUrl: game.imageUrl || null,
    description: "",
    richDescription: "",
    regions: [],
    checkoutTemplate: "",
    checkoutTemplateOptions: {},
    variants: [],
    status: "active",
    isPopular: false,
});

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
            relatedGames: [],
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
            onError: (error: { response?: { data?: { message?: string } } }) => {
                toast.error(
                    error.response?.data?.message || "Failed to save blog"
                );
            },
            redirectPath: "/admin/blogs",
        }
    );
    const [games, setGames] = useState<Game[]>([]);
    const [gameSearch, setGameSearch] = useState("");
    const [gamesLoading, setGamesLoading] = useState(false);
    const [gameDropdownOpen, setGameDropdownOpen] = useState(false);
    const gameSelectorRef = useRef<HTMLDivElement | null>(null);
    const gameSearchInputRef = useRef<HTMLInputElement | null>(null);
    const selectedGameIds = form.relatedGames;
    const selectedGames = selectedGameIds.flatMap((id) => {
        const game = games.find((item) => item._id === id);
        return game ? [game] : [];
    });
    const selectedIds = new Set(selectedGameIds);
    const availableGames = games.filter((game) => !selectedIds.has(game._id));

    const syncRelatedGames = (nextSelectedGames: Game[]) => {
        const firstGame = nextSelectedGames[0];
        updateForm({
            relatedGames: nextSelectedGames.map((game) => game._id),
            category: firstGame?.paymentCategory || firstGame?.category || "",
        });
        clearError("relatedGames");
    };

    const addRelatedGame = (game: Game) => {
        syncRelatedGames([...selectedGames, game]);
        setGameSearch("");
        setGameDropdownOpen(false);
    };

    const removeRelatedGame = (gameId: string) => {
        syncRelatedGames(selectedGames.filter((game) => game._id !== gameId));
    };

    const mergeGames = (incomingGames: Game[]) => {
        setGames((currentGames) => {
            const gameMap = new Map(currentGames.map((game) => [game._id, game]));
            incomingGames.forEach((game) => gameMap.set(game._id, game));
            return Array.from(gameMap.values());
        });
    };

    useEffect(() => {
        if (!gameDropdownOpen) return;

        gameSearchInputRef.current?.focus();

        const handleClickOutside = (event: MouseEvent) => {
            if (
                gameSelectorRef.current &&
                !gameSelectorRef.current.contains(event.target as Node)
            ) {
                setGameDropdownOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setGameDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameDropdownOpen]);

    useEffect(() => {
        if (!gameDropdownOpen) return;

        let ignore = false;

        const loadGames = async () => {
            setGamesLoading(true);
            try {
                const res = await gamesApiClient.list({
                    page: 1,
                    limit: 25,
                    status: "active",
                    search: gameSearch || undefined,
                });
                if (!ignore) {
                    setGames((currentGames) => {
                        const selectedGamesSnapshot = selectedGameIds
                            .flatMap((id) => {
                                const game = currentGames.find((item) => item._id === id);
                                return game ? [game] : [];
                            });
                        const selectedSnapshotIds = new Set(selectedGamesSnapshot.map((game) => game._id));

                        return [
                            ...selectedGamesSnapshot,
                            ...(res.data || []).filter((game) => !selectedSnapshotIds.has(game._id)),
                        ];
                    });
                }
            } catch {
                if (!ignore) {
                    toast.error("Failed to load games");
                }
            }

            if (!ignore) {
                setGamesLoading(false);
            }
        };

        const timeoutId = window.setTimeout(loadGames, gameSearch ? 350 : 0);

        return () => {
            ignore = true;
            window.clearTimeout(timeoutId);
        };
    }, [gameDropdownOpen, gameSearch, selectedGameIds]);

    // Load blog data
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const res = await blogApiClient.get(blogId);
                const blog = res.data;
                const populatedGames = toPopulatedGames(blog.relatedGames).map(normalizeRelatedGame);
                const relatedGameIds = toRelatedGameIds(blog.relatedGames);
                mergeGames(populatedGames);
                updateForm({
                    title: blog.title,
                    slug: blog.slug,
                    description: blog.description || "",
                    category: blog.category,
                    relatedGames: relatedGameIds,
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
        clearError("relatedGames");

        let isValid = true;

        if (!form.title?.trim()) {
            updateError("title", "Title is required");
            isValid = false;
        }
        if (!form.relatedGames || form.relatedGames.length === 0) {
            updateError("relatedGames", "Select at least one related game");
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
                relatedGames: formData.relatedGames,
                content: formData.content,
                seo: {
                    metaTitle: formData.seo.metaTitle,
                    metaDescription: formData.seo.metaDescription,
                    keywords: formData.seo.keywords
                        .split(",")
                        .flatMap((k) => {
                            const keyword = k.trim();
                            return keyword ? [keyword] : [];
                        }),
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
                        label="URL Slug"
                        value={form.slug}
                        onChange={(e) => {
                            const sanitized = e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, "")
                                .replace(/-{2,}/g, "-");
                            updateForm({ slug: sanitized });
                        }}
                        required={isEdit}
                        helperText={isEdit ? "Lowercase letters, numbers, and hyphens only. This determines the blog's URL." : "Leave empty to auto-generate from title"}
                        placeholder="my-blog-post"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full flex flex-col gap-1" ref={gameSelectorRef}>
                        <span id="related-games-label" className="text-sm font-medium text-gray-700">
                            Related Games <span className="text-red-500">*</span>
                        </span>

                        <div className="relative">
                            <div className={`rounded-xl border bg-white transition-all focus-within:ring-2 focus-within:ring-blue-100 ${
                                errors.relatedGames
                                    ? "border-red-500"
                                    : gameDropdownOpen
                                        ? "border-blue-500"
                                        : "border-gray-300"
                            }`}>
                                {selectedGames.length > 0 && (
                                    <div className="flex flex-wrap gap-2 border-b border-gray-100 p-2">
                                        {selectedGames.map((game) => (
                                            <button
                                                key={game._id}
                                                type="button"
                                                onClick={() => removeRelatedGame(game._id)}
                                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                title="Remove game"
                                            >
                                                {game.name}
                                                <TbX className="h-3.5 w-3.5" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setGameDropdownOpen((open) => !open)}
                                    aria-expanded={gameDropdownOpen}
                                    aria-labelledby="related-games-label"
                                    className="flex w-full items-center justify-between gap-3 rounded-xl bg-transparent px-3 py-2.5 text-left text-sm text-gray-900 outline-none"
                                >
                                    <span className="min-w-0 flex-1 truncate text-gray-500">
                                        {selectedGames.length > 0
                                            ? `${selectedGames.length} game${selectedGames.length > 1 ? "s" : ""} selected`
                                            : "Search and select games"}
                                    </span>
                                    <TbChevronDown
                                        className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                                            gameDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            </div>

                            {gameDropdownOpen && (
                                <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-30 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                                    <div className="border-b border-gray-100 p-2">
                                        <div className="relative">
                                            <TbSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                ref={gameSearchInputRef}
                                                type="search"
                                                value={gameSearch}
                                                onChange={(e) => setGameSearch(e.target.value)}
                                                placeholder="Search game name"
                                                aria-label="Search related games"
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto py-1">
                                        {gamesLoading && (
                                            <div className="px-3 py-4 text-sm text-gray-500">
                                                Loading games...
                                            </div>
                                        )}

                                        {!gamesLoading && availableGames.length === 0 && (
                                            <div className="px-3 py-4 text-sm text-gray-500">
                                                No games found
                                            </div>
                                        )}

                                        {!gamesLoading && availableGames.slice(0, 10).map((game) => (
                                            <button
                                                key={game._id}
                                                type="button"
                                                onClick={() => addRelatedGame(game)}
                                                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-gray-900 transition-colors hover:bg-gray-50"
                                            >
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-semibold">
                                                        {game.name}
                                                    </span>
                                                    <span className="block truncate text-xs text-gray-500">
                                                        {game.paymentCategory || game.category || "No category"}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    Add
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {errors.relatedGames ? (
                            <p className="text-xs text-red-500">{errors.relatedGames}</p>
                        ) : (
                            <p className="text-xs text-gray-500">
                                Selected blogs appear on each selected game detail page. Multiple games can be selected.
                            </p>
                        )}
                    </div>
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
                                <div>
                                    <div className="block text-sm font-medium text-gray-700 mb-1">
                                        Content Body
                                    </div>
                                    <RichTextEditor
                                        value={section.contentDescription}
                                        onChange={(html) =>
                                            updateSection(
                                                index,
                                                "contentDescription",
                                                html
                                            )
                                        }
                                        placeholder="Write section content here..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {form.content.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                            No content sections yet. Click Add Section to add
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
