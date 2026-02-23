import { clientApi } from "@/lib/http/index";
import { ExchangeRateListResponse, ExchangeRateUpdatePayload } from "./types";

const BASE = "/api/exchange-rates";

export const exchangeRateApiClient = {
    async getAll(): Promise<ExchangeRateListResponse> {
        const { data } = await clientApi.get(BASE);
        return data;
    },

    async bulkUpdate(payload: ExchangeRateUpdatePayload): Promise<{ success: boolean; data: any; message?: string }> {
        const { data } = await clientApi.put(BASE, payload);
        return data;
    },

    async deleteRate(id: string): Promise<{ success: boolean; message?: string }> {
        const { data } = await clientApi.delete(`${BASE}/${id}`);
        return data;
    },
};
