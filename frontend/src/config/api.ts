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
        byId: (id: Id) => `/api/games/${id}`,
        bySlug: (slug: Id) => `/api/games/${slug}`,
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
    },

    orders: {
        base: "/api/orders",
        myOrders: "/api/orders/my-orders",
        details: (id: Id) => `/api/orders/${id}`,
        adminAll: "/api/orders/admin/all",
        adminUpdate: (id: Id) => `/api/orders/admin/${id}`,
    },
};

// Helper to build full URLs
export const apiUrl = (path: string) =>
    `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
