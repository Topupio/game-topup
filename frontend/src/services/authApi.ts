"use client";

import { apiClient } from "@/lib/http";
import type { AuthUser } from "@/context/AuthContext";

export type LoginPayload = { email: string; password: string; recaptchaToken?: string | null };
export type RegisterPayload = { name: string; email: string; password: string; recaptchaToken?: string | null };

export const authApi = {
  async loginUser(payload: LoginPayload): Promise<void> {
    await apiClient.post("/api/auth/login", payload);
  },
  async registerUser(payload: RegisterPayload): Promise<void> {
    await apiClient.post("/api/auth/register", payload);
  },
  async logoutUser(): Promise<void> {
    await apiClient.post("/api/auth/logout", {});
  },
  async getProfile(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ success: boolean; user: AuthUser }>("/api/auth/me");
    return data.user;
  },
};
