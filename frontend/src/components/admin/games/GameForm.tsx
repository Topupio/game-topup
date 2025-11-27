"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Game, ApiResponse } from "@/lib/types/game";
import { GamePayload } from "@/services/games/types";
import ImageUploader from "./ImageUploader";
import RequiredFieldsBuilder from "./RequiredFieldsBuilder";
import StatusToggle from "./StatusToggle";
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
        description: "",
        imageUrl: null,
        status: "active",
        requiredFields: [],
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

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: GamePayload = {
                name: form.name,
                slug: form.slug,
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
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
            </div>

            {/* Slug */}
            <div>
                <Input
                    label="Slug"
                    placeholder="game-slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
            </div>

            {/* Description */}
            <div>
                <Textarea
                    label="Description"
                    placeholder="Enter description"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
            </div>

            {/* Status */}
            <div>
                <label className="font-medium">Status</label>
                <StatusToggle value={form.status} onChange={(status) => setForm({ ...form, status })} />
            </div>

            {/* Required Fields */}
            <RequiredFieldsBuilder fields={form.requiredFields} onChange={(fields) => setForm({ ...form, requiredFields: fields })} />

            <SubmitButton isLoading={loading} label={isEdit ? "Update Game" : "Create Game"} />
        </form>
    );
}