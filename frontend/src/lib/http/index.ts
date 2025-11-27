"use client";

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { getApiBase } from "@/config/api";

const API_BASE_URL = getApiBase() || process.env.NEXT_PUBLIC_API_BASE || "";

let cachedCsrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
    if (cachedCsrfToken) return cachedCsrfToken;
    const res = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch CSRF token");
    const data = await res.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken!;
}

export function clearCachedCsrf() {
    cachedCsrfToken = null;
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

apiClient.defaults.withCredentials = true;

// Attach CSRF token to state-changing requests
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const method = (config.method || "get").toLowerCase();
    const needsCsrf = ["post", "put", "patch", "delete"].includes(method);
    if (needsCsrf) {
        const token = await fetchCsrfToken();
        if (!config.headers) config.headers = {} as unknown as AxiosRequestHeaders;
        (config.headers as Record<string, string>)["csrf-token"] = token;
    }
    return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

function onRefreshed() {
    pendingQueue.forEach((cb) => cb());
    pendingQueue = [];
}

// Auto refresh on 401 once
apiClient.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !original?._retry) {
            if (isRefreshing) {
                await new Promise<void>((resolve) => pendingQueue.push(resolve));
                original._retry = true;
                return apiClient(original);
            }
            try {
                isRefreshing = true;
                const token = await fetchCsrfToken();
                await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: "POST",
                    headers: { "csrf-token": token },
                    credentials: "include",
                });
                onRefreshed();
                original._retry = true;
                return apiClient(original);
            } catch {
                throw error;
            } finally {
                isRefreshing = false;
            }
        }
        throw error;
    }
);

// clientApi is an alias for apiClient (browser use)
export const clientApi = apiClient;

// Default export for convenience
const httpExports = {
    apiClient,
    clientApi,
    clearCachedCsrf,
};

export default httpExports;

