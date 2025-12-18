"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Game } from "@/lib/types/game";
import { GamePayload } from "@/services/games/types";
import ImageUploader from "@/components/form/ImageUploader";
import RequiredFieldsBuilder from "./RequiredFieldsBuilder";
import StatusToggle from "@/components/form/StatusToggle";
import Input from "@/components/form/Input";
import Textarea from "@/components/form/TextArea";
import SubmitButton from "@/components/ui/SubmitButton";
import { gamesApiClient } from "@/services/games";

interface Props {
    gameId: string | "new";
}

export default function GameForm({ gameId }: Props) {
    const router = useRouter();
    const isEdit = gameId !== "new";

    const [form, setForm] = useState<Game>({
        _id: '',
        name: "",
        slug: "",
        category: "",
        description: "",
        imageUrl: null,
        status: "active",
        requiredFields: [],
    });
    const [errors, setErrors] = useState({
        name: "",
        description: "",
        category: "",
        requiredFields: [] as { fieldName?: string; fieldKey?: string; options?: string }[],
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Load game when editing (client-side fetch via API client)
    useEffect(() => {
        let mounted = true;
        if (isEdit) {
            (async () => {
                try {
                    const response = await gamesApiClient.get(gameId as string);
                    if (mounted) setForm(response.data);
                } catch (e) {
                    console.error("Failed to load game", e);
                    toast.error("Failed to load game data");
                }
            })();
        }
        return () => {
            mounted = false;
        };
    }, [isEdit, gameId]);

    const validate = () => {
        const newErrors: any = {
            name: "",
            description: "",
            requiredFields: [],
        };

        // Basic fields
        if (!form.name.trim()) newErrors.name = "Game name is required.";
        if (!form.category.trim()) newErrors.category = "Category is required.";
        if (!form.description.trim()) newErrors.description = "Description is required.";

        // Required fields validation
        form.requiredFields.forEach((field, index) => {
            const fieldErrors: any = {};

            if (!field.fieldName.trim()) {
                fieldErrors.fieldName = "Field name is required.";
            }
            if (!field.fieldKey.trim()) {
                fieldErrors.fieldKey = "Field key is required.";
            }

            if (field.fieldType === "dropdown" && (!field.options || field.options.length === 0)) {
                fieldErrors.options = "At least one option is required.";
            }

            newErrors.requiredFields[index] = fieldErrors;
        });

        // Remove empty field error objects
        newErrors.requiredFields = newErrors.requiredFields.filter(
            (e: any) => Object.keys(e).length > 0
        );

        setErrors(newErrors);

        const hasBaseErrors = newErrors.name || newErrors.description;
        const hasRequiredFieldErrors = newErrors.requiredFields.length > 0;

        return !hasBaseErrors && !hasRequiredFieldErrors;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix validation errors");
            return;
        }

        setLoading(true);
        try {
            const payload: GamePayload = {
                name: form.name,
                category: form.category,
                description: form.description,
                status: form.status,
                requiredFields: form.requiredFields,
                image: imageFile ?? null,
            };

            if (isEdit) {
                await gamesApiClient.update(gameId as string, payload);
                toast.success("Game updated");
            } else {
                await gamesApiClient.create(payload);
                toast.success("Game created");
            }

            router.push("/admin/games");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save game");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">{isEdit ? "Update Game" : "Create Game"}</h1>

            {/* IMAGE */}
            <ImageUploader
                imageUrl={form.imageUrl || null}
                aspectRatio={1}
                onChange={(file, preview) => {
                    setImageFile(file);
                    setForm((f) => ({ ...f, imageUrl: preview }));
                }}
            />

            {/* Name */}
            <div>
                <Input
                    label="Game Name"
                    placeholder="Enter game name"
                    value={form.name}
                    required
                    error={errors.name}
                    onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        setErrors((prev) => ({ ...prev, name: "" })); // clear error on typing
                    }}
                />
            </div>


            {/* Category */}
            <div>
                <Input
                    label="Category"
                    placeholder="Enter category"
                    value={form.category}
                    required
                    error={errors.category}
                    onChange={(e) => {
                        setForm({ ...form, category: e.target.value });
                        setErrors((prev) => ({ ...prev, category: "" })); // clear error on typing
                    }}
                />
            </div>

            {/* Description */}
            <div>
                <Textarea
                    label="Description"
                    placeholder="Enter description"
                    value={form.description}
                    required
                    error={errors.description}
                    onChange={(e) => {
                        setForm({ ...form, description: e.target.value });
                        setErrors((prev) => ({ ...prev, description: "" })); // clear error on typing
                    }}
                />
            </div>

            {/* Status */}
            <div>
                <label className="font-medium">Status</label>
                <StatusToggle value={form.status} onChange={(status) => setForm({ ...form, status })} />
            </div>

            {/* Required Fields */}
            <RequiredFieldsBuilder
                fields={form.requiredFields}
                onChange={(fields) => setForm({ ...form, requiredFields: fields })}
                errors={errors.requiredFields}
            />

            <SubmitButton isLoading={loading} label={isEdit ? "Update Game" : "Create Game"} />
        </form>
    );
}