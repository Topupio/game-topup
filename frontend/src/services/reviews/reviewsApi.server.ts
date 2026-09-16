import { endpoints } from "@/config/api";
import { serverApi } from "@/lib/http/server";
import { AdminReviewsResponse, GameReviewsResponse, ReviewParams } from "./types";

export const reviewsApiServer = {
    async getGameReviews(gameId: string): Promise<GameReviewsResponse> {
        return serverApi.get(endpoints.reviews.game(gameId), {
            revalidate: 300,
        });
    },

    async adminGetReviews(params?: ReviewParams): Promise<AdminReviewsResponse> {
        return serverApi.get(endpoints.reviews.adminAll, {
            params,
            revalidate: 0,
        });
    },
};
