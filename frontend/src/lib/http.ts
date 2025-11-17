"use client";

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE || "").trim();
if (!API_BASE_URL) {
  if (typeof window !== "undefined") {
    // Falling back to same-origin; ensure your Next.js dev proxy or deployment routes API under the same domain.
    // Example: next.config.ts rewrites /api/* -> backend.
    // eslint-disable-next-line no-console
    console.warn("NEXT_PUBLIC_API_BASE is not set. Using same-origin for API calls.");
  }
}

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
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach CSRF token to state-changing requests
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method || "get").toLowerCase();
  const needsCsrf = ["post", "put", "patch", "delete"].includes(method);
  if (needsCsrf) {
    const token = await fetchCsrfToken();
    config.headers = {
      ...config.headers,
      "csrf-token": token,
    } as any;
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
    const original = error.config as any;
    if (error.response?.status === 401 && !original?._retry) {
      if (isRefreshing) {
        // queue the request until refresh finished
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
      } catch (e) {
        throw error;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);
