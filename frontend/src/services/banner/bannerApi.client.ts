"use client";

import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import { toFormData } from "@/utils/convertToFormData";
import { BannerListResponse, BannerPayload, BannerResponse } from "./types";

export const bannerApiClient = {
    async listActive(): Promise<BannerListResponse> {
        const { data } = await clientApi.get(endpoints.banners.root);
        return data;
    },

    async listAll(): Promise<BannerListResponse> {
        const { data } = await clientApi.get(endpoints.banners.admin);
        return data;
    },

    async get(id: string): Promise<BannerResponse> {
        const { data } = await clientApi.get(endpoints.banners.byId(id));
        return data;
    },

    async create(payload: BannerPayload): Promise<BannerResponse> {
        const fd = toFormData(payload);
        const { data } = await clientApi.post(endpoints.banners.root, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    async update(id: string, payload: BannerPayload): Promise<BannerResponse> {
        const fd = toFormData(payload);
        const { data } = await clientApi.put(endpoints.banners.byId(id), fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const { data } = await clientApi.delete(endpoints.banners.byId(id));
        return data;
    },
};
