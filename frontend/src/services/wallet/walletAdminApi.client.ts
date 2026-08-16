import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import type { Pagination, WalletTopup, WalletTransaction } from "./types";

type Ok<T> = { success: boolean; data: T; message?: string };

export interface AdminWalletUser {
    _id: string;
    name: string;
    email: string;
    status?: string;
}

export interface AdminWalletRow {
    _id: string;
    user: AdminWalletUser | null;
    balancePaise: number;
    status: "active" | "frozen";
    updatedAt: string;
}

/** A ledger row as the admin sees it, with the user and admin resolved. */
export interface AdminTransaction extends Omit<WalletTransaction, "order"> {
    user: AdminWalletUser | null;
    admin?: AdminWalletUser | null;
    order?: { _id: string; orderId: string } | null;
}

export interface AdminTopup extends Omit<WalletTopup, "adminNote"> {
    user: AdminWalletUser | null;
    admin?: AdminWalletUser | null;
    adminNote?: string | null;
}

export interface WalletStats {
    totalLiabilityPaise: number;
    walletCount: number;
    pendingTopups: number;
    topupsToday: number;
}

export interface AdminWalletSettings {
    _id: string;
    enabled: boolean;
    minTopupPaise: number;
    maxTopupPaise: number;
    dailyTopupCapPaise: number;
    maxBalancePaise: number;
    upiTopupEnabled: boolean;
    usdtTopupEnabled: boolean;
    walletPaymentEnabled: boolean;
    topupExpiryMinutes: number;
}

export const walletAdminApiClient = {
    async getStats(): Promise<Ok<WalletStats>> {
        const { data } = await clientApi.get(endpoints.wallet.admin.stats);
        return data;
    },

    async listTopups(
        params: { page?: number; limit?: number; status?: string; method?: string } = {},
        signal?: AbortSignal
    ) {
        const { data } = await clientApi.get<Ok<{ topups: AdminTopup[]; pagination: Pagination }>>(
            endpoints.wallet.admin.topups,
            { params, signal }
        );
        return data;
    },

    async approveTopup(id: string, adminNote?: string) {
        const { data } = await clientApi.post<Ok<{ balancePaise: number }>>(
            endpoints.wallet.admin.approveTopup(id),
            { adminNote }
        );
        return data;
    },

    /** A note is required — the customer believes they paid and needs a reason. */
    async rejectTopup(id: string, adminNote: string) {
        const { data } = await clientApi.post<Ok<{ topup: AdminTopup }>>(
            endpoints.wallet.admin.rejectTopup(id),
            { adminNote }
        );
        return data;
    },

    async listTransactions(
        params: {
            page?: number;
            limit?: number;
            type?: string;
            userId?: string;
            adminOnly?: string;
            from?: string;
            to?: string;
        } = {},
        signal?: AbortSignal
    ) {
        const { data } = await clientApi.get<
            Ok<{ transactions: AdminTransaction[]; pagination: Pagination }>
        >(endpoints.wallet.admin.transactions, { params, signal });
        return data;
    },

    async listWallets(
        params: { page?: number; limit?: number; search?: string } = {},
        signal?: AbortSignal
    ) {
        const { data } = await clientApi.get<Ok<{ wallets: AdminWalletRow[]; pagination: Pagination }>>(
            endpoints.wallet.admin.wallets,
            { params, signal }
        );
        return data;
    },

    async getUserWallet(userId: string) {
        const { data } = await clientApi.get<
            Ok<{ user: AdminWalletUser; wallet: AdminWalletRow; transactions: AdminTransaction[] }>
        >(endpoints.wallet.admin.walletByUser(userId));
        return data;
    },

    /** Both adjustments require a reason; the server rejects them without one. */
    async creditWallet(userId: string, amountPaise: number, reason: string) {
        const { data } = await clientApi.post<Ok<{ balancePaise: number }>>(
            endpoints.wallet.admin.credit(userId),
            { amountPaise, reason }
        );
        return data;
    },

    async debitWallet(userId: string, amountPaise: number, reason: string) {
        const { data } = await clientApi.post<Ok<{ balancePaise: number }>>(
            endpoints.wallet.admin.debit(userId),
            { amountPaise, reason }
        );
        return data;
    },

    async getSettings(): Promise<Ok<AdminWalletSettings>> {
        const { data } = await clientApi.get(endpoints.wallet.admin.settings);
        return data;
    },

    async updateSettings(payload: Partial<AdminWalletSettings>): Promise<Ok<AdminWalletSettings>> {
        const { data } = await clientApi.put(endpoints.wallet.admin.settings, payload);
        return data;
    },

    async getLatestAudit() {
        const { data } = await clientApi.get<
            Ok<{ audit: Record<string, unknown> | null; isStale: boolean }>
        >(endpoints.wallet.admin.auditLatest);
        return data;
    },
};
