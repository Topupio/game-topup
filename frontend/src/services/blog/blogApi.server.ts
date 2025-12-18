import { serverApi } from "@/lib/http/server";
import { endpoints } from "@/config/api";
import { BlogListResponse, BlogResponse } from "./types";

export const blogApiServer = {
    async list(params?: { page?: number; limit?: number; category?: string }): Promise<BlogListResponse> {
        return serverApi.get<BlogListResponse>(endpoints.blogs.root, { params });
    },

    async get(idOrSlug: string): Promise<BlogResponse> {
        return serverApi.get<BlogResponse>(endpoints.blogs.byIdOrSlug(idOrSlug));
    },
};
