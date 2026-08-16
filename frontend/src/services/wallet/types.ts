/**
 * Wallet types.
 *
 * Every amount ending in `Paise` is an integer number of paise (₹1 = 100 paise). The
 * wallet is held in INR; anything shown in another currency is a converted display
 * value and is marked approximate, because admin-managed rates can move it without
 * any transaction behind the change.
 */

export type WalletTransactionType =
    | "credit_topup"
    | "credit_refund"
    | "credit_manual"
    | "credit_promo"
    | "credit_referral"
    | "debit_order"
    | "debit_manual";

export type TopupStatus = "pending" | "paid" | "confirmed" | "rejected" | "expired";

export type TopupMethod = "upi" | "usdt";

export interface WalletBalance {
    balancePaise: number;
    balanceInr: number;
    currency: "INR";
    status: "active" | "frozen";
    /** Present only when the user is browsing in something other than INR. */
    display: {
        amount: number;
        currency: string;
        approximate: true;
    } | null;
    updatedAt?: string;
}

export interface WalletTransaction {
    _id: string;
    type: WalletTransactionType;
    amountPaise: number;
    deltaPaise: number;
    balanceAfterPaise: number;
    seq: number;
    reason?: string | null;
    order?: { _id: string; orderId: string } | null;
    topup?: { _id: string; topupRef: string; method: TopupMethod } | null;
    originalCurrency?: string | null;
    originalAmount?: number | null;
    fxRate?: number | null;
    meta?: Record<string, unknown>;
    createdAt: string;
}

export interface WalletTopup {
    _id: string;
    topupRef: string;
    method: TopupMethod;
    amountPaise: number;
    status: TopupStatus;
    originalCurrency?: string;
    originalAmount?: number;
    upi?: {
        upiId?: string;
        payeeName?: string;
        deepLink?: string;
        amountInr?: number;
        utrNumber?: string | null;
        utrSubmittedAt?: string | null;
    };
    crypto?: {
        invoiceUrl?: string;
        payCurrency?: string;
        actuallyPaid?: number;
    };
    adminNote?: string | null;
    creditedAt?: string | null;
    expiresAt?: string | null;
    createdAt: string;
}

export interface WalletSettings {
    enabled: boolean;
    minTopupPaise: number;
    maxTopupPaise: number;
    dailyTopupCapPaise: number;
    maxBalancePaise: number;
    upiTopupEnabled: boolean;
    usdtTopupEnabled: boolean;
    walletPaymentEnabled: boolean;
}

export interface UpiTopupSession {
    topupId: string;
    topupRef: string;
    amountPaise: number;
    amountInr: number;
    currency: "INR";
    upiId: string;
    payeeName: string;
    deepLink: string;
    qrPayload: string;
    expiresAt: string;
    instructions: string;
}

export interface CryptoTopupSession {
    topupId: string;
    topupRef: string;
    amountPaise: number;
    amountUsd: number;
    invoiceUrl: string;
    expiresAt: string;
}

/**
 * What the server will actually debit for an order.
 *
 * Prices shown on screen are converted client-side for readability; this is the
 * authoritative figure, so checkout confirms against it rather than its own maths.
 */
export interface WalletPaymentQuote {
    orderId: string;
    amountPaise: number;
    originalAmount: number;
    originalCurrency: string;
    fxRate: number;
    balancePaise: number;
    sufficient: boolean;
    shortfallPaise: number;
    available: boolean;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
