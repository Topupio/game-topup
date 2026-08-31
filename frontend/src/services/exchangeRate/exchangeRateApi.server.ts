import { serverApi } from "@/lib/http/server";
import { endpoints } from "@/config/api";
import { ExchangeRateListResponse } from "./types";

export const exchangeRateApiServer = {
    async getAll(): Promise<ExchangeRateListResponse> {
        return serverApi.get(endpoints.exchangeRates.root);
    },
};
