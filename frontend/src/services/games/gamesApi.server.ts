// src/services/games/gamesApi.server.ts
import { serverApi } from "@/lib/http/server";
import { Game, GamesListResponse, GameWithProducts, ApiResponse, CategoryResponse } from "@/lib/types/game";
import { GamePayload } from "./types";
import { endpoints } from "@/config/api";

export const gamesApiServer = {
    async list(params?: { page: number, limit: number, category?: string }): Promise<GamesListResponse> {
        return serverApi.get(endpoints.games.root, { params });
    },

    async listHomeGames(): Promise<CategoryResponse> {
        return serverApi.get(endpoints.games.home);
    },

    async get(id: string): Promise<ApiResponse<GameWithProducts>> {
        return serverApi.get(endpoints.games.byId(id));
    },

    async getBySlug(slug: string): Promise<ApiResponse<GameWithProducts>> {
        return serverApi.get(endpoints.games.bySlug(slug));
    },

    async create(payload: GamePayload): Promise<Game> {
        return serverApi.post(endpoints.games.root, payload);
    },

    async update(id: string, payload: GamePayload): Promise<Game> {
        return serverApi.post(endpoints.games.byId(id), payload, {
            method: "PUT",
        });
    },

    async remove(id: string): Promise<{ success: boolean }> {
        return serverApi.post(endpoints.games.byId(id), null, {
            method: "DELETE",
        });
    },
};
