"use client";

import { endpoints } from "@/config/api";
import { clientApi } from "@/lib/http";
import { AdminReviewsResponse, GameReviewsResponse, ReviewParams } from "./types";

export const reviewsApiClient = {
    async getGameReviews(gameId: string, signal?: AbortSignal): Promise<GameReviewsResponse> {
        const { data } = await clientApi.get(endpoints.reviews.game(gameId), { signal });
        return data;
    },

    async adminGetReviews(params?: ReviewParams, signal?: AbortSignal): Promise<AdminReviewsResponse> {
        const { data } = await clientApi.get(endpoints.reviews.adminAll, { params, signal });
        return data;
    },

    async adminDeleteReview(id: string): Promise<{ success: boolean; message?: string }> {
        const { data } = await clientApi.delete(endpoints.reviews.adminDelete(id));
        return data;
    },
};
