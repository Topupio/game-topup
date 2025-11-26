"use client";

import axios from "axios";
import { fetchCsrfToken, clearCachedCsrf } from "../csrf";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// axios instance (browser only)
export const clientApi = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Attach CSRF token to mutating requests
clientApi.interceptors.request.use(async (config) => {
    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
        config.headers["csrf-token"] = await fetchCsrfToken();
    }
    return config;
});

let refreshing = false;
let queue: Array<() => void> = [];

// Handle 401 → Refresh token automatically
clientApi.interceptors.response.use(
    (r) => r,
    async (error) => {
        const original = error.config as any;

        if (error.response?.status === 401 && !original?._retry) {
            if (refreshing) {
                await new Promise<void>((resolve) => queue.push(resolve));
                original._retry = true;
                return clientApi(original);
            }

            try {
                refreshing = true;

                await clientApi.post("/api/auth/refresh", null, {
                    headers: { "csrf-token": await fetchCsrfToken() },
                });

                queue.forEach((fn) => fn());
                queue = [];

                original._retry = true;
                return clientApi(original);
            } catch (e) {
                clearCachedCsrf();
                throw e;
            } finally {
                refreshing = false;
            }
        }

        throw error;
    }
);
