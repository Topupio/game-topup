// config/api.ts
// Full-featured API helpers (Node + Browser safe)

export function getApiBase(fallbackOrigin?: string) {
    const base =
        (process.env.NEXT_PUBLIC_API_BASE || "").trim() ||
        (fallbackOrigin ? fallbackOrigin.trim() : "") ||
        (typeof window !== "undefined" ? window.location.origin : "");

    return base.replace(/\/$/, "");
}

// Evaluated at runtime (NOT imported by Edge middleware)
export const API_BASE = getApiBase();

type Id = string;

export const endpoints = {
    dashboard: {
        root: "/api/dashboard",
    },

    games: {
        root: "/api/games",
        home: "/api/games/home",
        categories: "/api/games/categories",
        paymentCategories: "/api/games/payment-categories",
        popular: "/api/games/popular",
        byId: (id: Id) => `/api/games/${id}`,
        bySlug: (slug: Id) => `/api/games/${slug}`,
        verifyPlayer: "/api/games/verify-player",
    },

    products: {
        root: "/api/products",
        popular: "/api/products/popular",
        byId: (id: Id) => `/api/products/${id}`,
        bySlug: (slug: Id) => `/api/products/${slug}`,
    },

    banners: {
        root: "/api/banners",
        admin: "/api/banners/admin",
        byId: (id: Id) => `/api/banners/${id}`,
    },

    blogs: {
        root: "/api/blogs",
        byIdOrSlug: (idOrSlug: Id) => `/api/blogs/${idOrSlug}`,
    },

    admin: {
        logs: "/api/admin/logs",
        users: "/api/admin/users",
        userStatus: (id: Id) => `/api/admin/users/${id}/status`,
    },

    upload: {
        image: "/api/upload/image",
    },

    payments: {
        paypalCreateOrder: "/api/payments/paypal/create-order",
        paypalCaptureOrder: "/api/payments/paypal/capture-order",
        nowpaymentsCreateInvoice: "/api/payments/nowpayments/create-invoice",
        upiInitiate: "/api/payments/upi/initiate",
        upiSubmitUtr: "/api/payments/upi/submit-utr",
        settings: "/api/payments/settings",
        walletQuote: "/api/payments/wallet/quote",
        walletPay: "/api/payments/wallet/pay",
    },

    wallet: {
        me: "/api/wallet/me",
        transactions: "/api/wallet/me/transactions",
        topups: "/api/wallet/me/topups",
        publicSettings: "/api/wallet/settings/public",
        upiInitiate: "/api/wallet/topups/upi/initiate",
        usdtInitiate: "/api/wallet/topups/usdt/initiate",
        topupById: (id: Id) => `/api/wallet/topups/${id}`,
        submitUtr: (id: Id) => `/api/wallet/topups/${id}/utr`,

        admin: {
            stats: "/api/wallet/admin/stats",
            wallets: "/api/wallet/admin/wallets",
            walletByUser: (userId: Id) => `/api/wallet/admin/wallets/${userId}`,
            userTransactions: (userId: Id) => `/api/wallet/admin/wallets/${userId}/transactions`,
            credit: (userId: Id) => `/api/wallet/admin/wallets/${userId}/credit`,
            debit: (userId: Id) => `/api/wallet/admin/wallets/${userId}/debit`,
            walletStatus: (userId: Id) => `/api/wallet/admin/wallets/${userId}/status`,
            topups: "/api/wallet/admin/topups",
            approveTopup: (id: Id) => `/api/wallet/admin/topups/${id}/approve`,
            rejectTopup: (id: Id) => `/api/wallet/admin/topups/${id}/reject`,
            transactions: "/api/wallet/admin/transactions",
            settings: "/api/wallet/admin/settings",
            auditLatest: "/api/wallet/admin/audit/latest",
            auditRun: "/api/wallet/admin/audit/run",
        },
    },

    orders_admin_refund: {
        quote: (id: Id) => `/api/orders/admin/${id}/refund-quote`,
        refundToWallet: (id: Id) => `/api/orders/admin/${id}/refund-to-wallet`,
    },

    exchangeRates: {
        root: "/api/exchange-rates",
        byId: (id: Id) => `/api/exchange-rates/${id}`,
    },

    checkoutTemplates: {
        root: "/api/checkout-templates",
        byKey: (key: string) => `/api/checkout-templates/${key}`,
    },

    reviews: {
        game: (gameId: Id) => `/api/reviews/games/${gameId}`,
        adminAll: "/api/reviews/admin/all",
        adminDelete: (id: Id) => `/api/reviews/admin/${id}`,
    },

    orders: {
        base: "/api/orders",
        myOrders: "/api/orders/my-orders",
        adminMessages: "/api/orders/admin-messages",
        clearAdminMessages: "/api/orders/admin-messages/clear",
        recentPublic: "/api/orders/recent-public",
        recentReviewEligible: "/api/orders/review-eligible/recent",
        gameReviewEligible: (gameId: Id) => `/api/orders/review-eligible/game/${gameId}`,
        details: (id: Id) => `/api/orders/${id}`,
        markAdminMessageRead: (id: Id) => `/api/orders/${id}/admin-message/read`,
        review: (id: Id) => `/api/orders/${id}/review`,
        adminAll: "/api/orders/admin/all",
        adminUpdate: (id: Id) => `/api/orders/admin/${id}`,
    },
};

// Helper to build full URLs
export const apiUrl = (path: string) =>
    `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
