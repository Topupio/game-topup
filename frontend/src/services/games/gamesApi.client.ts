// src/services/games/gamesApi.client.ts
"use client";

import { clientApi } from "@/lib/http/index";
import { ApiResponse, Game, GamesListResponse } from "@/lib/types/game";
import { GamePayload } from "./types";
import { endpoints } from "@/config/api";

export const gamesApiClient = {
    async list(params?: Record<string, unknown> | undefined): Promise<GamesListResponse> {
        const { data } = await clientApi.get(endpoints.games.root, { params });
        return data;
    },

    async get(id: string): Promise<ApiResponse<Game>> {
        const { data } = await clientApi.get(endpoints.games.byId(id));
        return data;
    },

    async create(payload: GamePayload): Promise<ApiResponse<Game>> {
        const fd = toFormData(payload);
        const { data } = await clientApi.post(endpoints.games.root, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    async update(id: string, payload: GamePayload): Promise<ApiResponse<Game>> {
        const fd = toFormData(payload);
        const { data } = await clientApi.put(endpoints.games.byId(id), fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    async remove(id: string): Promise<{ success: boolean }> {
        const { data } = await clientApi.delete(endpoints.games.byId(id));
        return data;
    },
};

// Convert payload → FormData
function toFormData(payload: GamePayload) {
    const fd = new FormData();
    fd.append("name", payload.name);
    if (payload.slug) fd.append("slug", payload.slug);
    if (payload.description) fd.append("description", payload.description);
    fd.append("status", payload.status);
    fd.append("requiredFields", JSON.stringify(payload.requiredFields || []));
    if (payload.image) fd.append("image", payload.image);
    return fd;
}
