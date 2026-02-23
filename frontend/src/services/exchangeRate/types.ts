export interface ExchangeRate {
    _id: string | null;
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    updatedAt: string | null;
    isDefault: boolean;
}

export interface ExchangeRateListResponse {
    success: boolean;
    baseCurrency: string;
    data: ExchangeRate[];
}

export interface ExchangeRateUpdatePayload {
    rates: { targetCurrency: string; rate: number }[];
}
