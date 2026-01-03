import { serverApi } from "@/lib/http/server";
import { endpoints } from "@/config/api";
import { UserResponse, UserParams } from "./types";

export const usersApiServer = {
    async list(params?: UserParams): Promise<UserResponse> {
        return serverApi.get(endpoints.admin.users, { params: params as any });
    },
};
