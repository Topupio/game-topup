// Centralized API configuration and endpoints

export function getApiBase(fallbackOrigin?: string) {
    const base =
        (process.env.NEXT_PUBLIC_API_BASE || "").trim() ||
        (fallbackOrigin ? fallbackOrigin.trim() : "") ||
        (typeof window !== "undefined" ? window.location.origin : "");
    return base.replace(/\/$/, "");
}

export const API_BASE = getApiBase();

export const endpoints = {
    games: {
        root: "/api/games",
        home: "/api/games/home",
        categories: "/api/games/categories",
        byId: (id: string) => `/api/games/${id}`,
        bySlug: (slug: String) => `/api/games/${slug}`
    },
    products: {
        root: "/api/products",
        byId: (id: string) => `/api/products/${id}`,
        bySlug: (slug: String) => `/api/products/${slug}`
    },
    banners: {
        root: "/api/banners",
        admin: "/api/banners/admin",
        byId: (id: string) => `/api/banners/${id}`
    },
    blogs: {
        root: "/api/blogs",
        byIdOrSlug: (idOrSlug: string) => `/api/blogs/${idOrSlug}`,
    },
    // add more domains here (products, orders, users, etc.)
};

export const apiUrl = (path: string) =>
    `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
