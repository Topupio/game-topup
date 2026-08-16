import { clientApi } from "@/lib/http/index";
import type {
    CryptoTopupSession,
    Pagination,
    UpiTopupSession,
    WalletBalance,
    WalletPaymentQuote,
    WalletSettings,
    WalletTopup,
    WalletTransaction,
} from "./types";

const BASE = "/api/wallet";

type Ok<T> = { success: boolean; data: T; message?: string };

export const walletApiClient = {
    async getBalance(currency?: string): Promise<Ok<WalletBalance>> {
        const { data } = await clientApi.get(`${BASE}/me`, {
            params: currency ? { currency } : undefined,
        });
        return data;
    },

    async getTransactions(params: { page?: number; limit?: number; type?: string } = {}) {
        const { data } = await clientApi.get<
            Ok<{ transactions: WalletTransaction[]; pagination: Pagination }>
        >(`${BASE}/me/transactions`, { params });
        return data;
    },

    async getTopups(params: { page?: number; limit?: number; status?: string } = {}) {
        const { data } = await clientApi.get<Ok<{ topups: WalletTopup[]; pagination: Pagination }>>(
            `${BASE}/me/topups`,
            { params }
        );
        return data;
    },

    async getSettings(): Promise<Ok<WalletSettings>> {
        const { data } = await clientApi.get(`${BASE}/settings/public`);
        return data;
    },

    async startUpiTopup(amountPaise: number): Promise<Ok<UpiTopupSession>> {
        const { data } = await clientApi.post(`${BASE}/topups/upi/initiate`, { amountPaise });
        return data;
    },

    async startCryptoTopup(amountPaise: number): Promise<Ok<CryptoTopupSession>> {
        const { data } = await clientApi.post(`${BASE}/topups/usdt/initiate`, { amountPaise });
        return data;
    },

    async submitUtr(topupId: string, utrNumber: string) {
        const { data } = await clientApi.post<Ok<{ topupId: string; status: string }>>(
            `${BASE}/topups/${topupId}/utr`,
            { utrNumber }
        );
        return data;
    },

    /** Poll a top-up while waiting for it to be verified or credited. */
    async getTopup(topupId: string): Promise<Ok<WalletTopup>> {
        const { data } = await clientApi.get(`${BASE}/topups/${topupId}`);
        return data;
    },

    /** Exact amount the server will debit for an order, plus whether it can be covered. */
    async quotePayment(orderId: string): Promise<Ok<WalletPaymentQuote>> {
        const { data } = await clientApi.get("/api/payments/wallet/quote", { params: { orderId } });
        return data;
    },

    /** Only the order id is sent — the amount is decided server-side. */
    async payWithWallet(orderId: string) {
        const { data } = await clientApi.post<Ok<{ order: unknown; balancePaise: number }>>(
            "/api/payments/wallet/pay",
            { orderId }
        );
        return data;
    },
};
