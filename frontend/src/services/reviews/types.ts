import { GameSummary, UserSummary } from "@/services/orders/types";

export interface ReviewOrderSummary {
    _id: string;
    orderId: string;
    paymentStatus?: string;
    orderStatus?: string;
    productSnapshot?: {
        name?: string;
    };
}

export interface ReviewUserSummary extends Partial<UserSummary> {
    _id: string;
    name?: string;
    email?: string;
}

export interface GameReviewItem {
    _id: string;
    user: ReviewUserSummary | string;
    game: GameSummary | string;
    order?: ReviewOrderSummary | string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface RatingDistribution {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
}

export interface GameReviewsResponse {
    success: boolean;
    data: {
        reviews: GameReviewItem[];
        summary: {
            averageRating: number;
            totalReviews: number;
            ratingDistribution: RatingDistribution;
        };
    };
}

export interface AdminReviewsResponse {
    success: boolean;
    data: {
        reviews: GameReviewItem[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface ReviewParams extends Record<string, unknown> {
    page?: number;
    limit?: number;
    search?: string;
}
