// src/services/games/gamesApi.server.ts
import { serverApi } from "@/lib/http/server";
import { Game, GamesListResponse } from "@/lib/types/game";
import { GamePayload } from "./types";
import { endpoints } from "@/config/api";

export const gamesApiServer = {
    async list(): Promise<GamesListResponse> {
        return serverApi.get(endpoints.games.root);
    },

    async get(id: string): Promise<Game> {
        return serverApi.get(endpoints.games.byId(id));
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
