import { endpoints } from "@/config/api";
import { serverApi } from "@/lib/http/server";
import { AdminReviewsResponse, ReviewParams } from "./types";

export const reviewsApiServer = {
    async adminGetReviews(params?: ReviewParams): Promise<AdminReviewsResponse> {
        return serverApi.get(endpoints.reviews.adminAll, {
            params,
            revalidate: 0,
        });
    },
};
