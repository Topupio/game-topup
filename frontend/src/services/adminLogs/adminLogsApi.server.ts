import { serverApi } from "@/lib/http/server";
import { endpoints } from "@/config/api";
import { AdminLogResponse, AdminLogParams } from "./types";

export const adminLogsApiServer = {
    async list(params?: AdminLogParams): Promise<AdminLogResponse> {
        return serverApi.get(endpoints.admin.logs, { params: params as any });
    },
};