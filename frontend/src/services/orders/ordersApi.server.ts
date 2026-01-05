import { serverApi } from "@/lib/http/server";
import { endpoints } from "@/config/api";
import { ListOrderResponse, OrderParams, OrderResponse } from "./types";

export const ordersApiServer = {
    async adminGetOrders(params: OrderParams = {}): Promise<ListOrderResponse> {
        const url = endpoints.orders.adminAll;
        return serverApi.get(url, { params });
    },

    async getOrderDetails(id: string): Promise<OrderResponse> {
        const url = endpoints.orders.details(id);
        return serverApi.get(url);
    },

    async getMyOrders(params: OrderParams = {}): Promise<ListOrderResponse> {
        const url = endpoints.orders.myOrders;
        return serverApi.get(url, { params });
    },
};