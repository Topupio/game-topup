import { serverApi } from "@/lib/http/server";
import { endpoints } from "@/config/api";
import { ListOrderResponse, OrderParams, OrderResponse } from "./types";

export const ordersApiServer = {
    async adminGetOrders(params: OrderParams = {}): Promise<ListOrderResponse> {
        return serverApi.get((endpoints as any).orders.adminAll, { params });
    },

    async getOrderDetails(id: string): Promise<OrderResponse> {
        const url = endpoints.orders.details(id);
        return serverApi.get(url);
    },

    async getMyOrders(params: OrderParams = {}): Promise<ListOrderResponse> {
        return serverApi.get((endpoints as any).orders.myOrders, { params });
    },
};
