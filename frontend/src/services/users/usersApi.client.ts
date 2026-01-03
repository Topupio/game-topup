"use client";

import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import { UserResponse, UserParams, User } from "./types";

export const usersApiClient = {
    async list(params?: UserParams): Promise<UserResponse> {
        const { data } = await clientApi.get(endpoints.admin.users, { params: params as any });
        return data;
    },

    async updateStatus(id: string, status: "active" | "blocked"): Promise<{ success: boolean; data: User; message: string }> {
        const { data } = await clientApi.patch(endpoints.admin.userStatus(id), { status });
        return data;
    },
};
