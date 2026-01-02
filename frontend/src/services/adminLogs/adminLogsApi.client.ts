"use client";

import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import { AdminLogResponse, AdminLogParams } from "./types";

export const adminLogsApiClient = {
    async list(params?: AdminLogParams): Promise<AdminLogResponse> {
        const { data } = await clientApi.get(endpoints.admin.logs, { params });
        return data;
    },
};
