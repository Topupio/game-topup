import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import {
    AdminOrderUpdatePayload,
    CreateOrderPayload,
    OrderResponse,
    ListOrderResponse,
    OrderParams,
    PublicRecentOrdersResponse,
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

    async getRecentPublicOrders(limit = 5, signal?: AbortSignal): Promise<PublicRecentOrdersResponse> {
        const { data } = await clientApi.get(endpoints.orders.recentPublic, {
            params: { limit },
            signal,
        });
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
