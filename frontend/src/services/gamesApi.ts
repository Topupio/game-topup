import { apiClient } from "@/lib/http";
import { endpoints } from "@/config/api";
import { Game, GamesListResponse } from "@/lib/types/game";

export type GamePayload = {
    name: string;
    slug?: string;
    description?: string;
    status: "active" | "inactive";
    requiredFields: Game["requiredFields"];
    image?: File | null;
};

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

export const gamesApi = {
    // list games (add query typing later as needed)
    async list(params?: Record<string, any>) {
        const { data } = await apiClient.get(endpoints.games.root, { params });
        return data as GamesListResponse;
    },

    async get(id: string) {
        const { data } = await apiClient.get(endpoints.games.byId(id));
        return data as Game;
    },

    async create(payload: GamePayload) {
        const fd = toFormData(payload);
        const { data } = await apiClient.post(endpoints.games.root, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data as Game;
    },

    async update(id: string, payload: GamePayload) {
        const fd = toFormData(payload);
        const { data } = await apiClient.put(endpoints.games.byId(id), fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data as Game;
    },

    async remove(id: string) {
        const { data } = await apiClient.delete(endpoints.games.byId(id));
        return data as { success: boolean; message?: string };
    },
};
