import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import {
    AdminOrderUpdatePayload,
    CreateOrderPayload,
    GameReviewResponse,
    ListOrderResponse,
    OrderParams,
    OrderResponse,
    ReviewEligibleOrderResponse,
    SubmitOrderReviewPayload,
} from "./types";

export const ordersApiClient = {
    async create(data: CreateOrderPayload): Promise<OrderResponse> {
        const { data: res } = await clientApi.post(endpoints.orders.base, data);
        return res;
    },

    async getMyOrders(params?: OrderParams, signal?: AbortSignal): Promise<ListOrderResponse> {
        const { data } = await clientApi.get(endpoints.orders.myOrders, { params, signal });
        return data;
    },

    async getOrderDetails(id: string, signal?: AbortSignal): Promise<OrderResponse> {
        const { data } = await clientApi.get(endpoints.orders.details(id), { signal });
        return data;
    },

    async getRecentReviewEligibleOrder(signal?: AbortSignal): Promise<ReviewEligibleOrderResponse> {
        const { data } = await clientApi.get(endpoints.orders.recentReviewEligible, { signal });
        return data;
    },

    async getGameReviewEligibleOrder(gameId: string, signal?: AbortSignal): Promise<ReviewEligibleOrderResponse> {
        const { data } = await clientApi.get(endpoints.orders.gameReviewEligible(gameId), { signal });
        return data;
    },

    async submitOrderReview(id: string, payload: SubmitOrderReviewPayload): Promise<GameReviewResponse> {
        const { data } = await clientApi.post(endpoints.orders.review(id), payload);
        return data;
    },

    async adminGetOrders(params?: OrderParams, signal?: AbortSignal): Promise<ListOrderResponse> {
        const { data } = await clientApi.get(endpoints.orders.adminAll, { params, signal });
        return data;
    },

    async adminUpdateOrder(id: string, updateData: AdminOrderUpdatePayload): Promise<OrderResponse> {
        const { data } = await clientApi.patch(endpoints.orders.adminUpdate(id), updateData);
        return data;
    },
};
