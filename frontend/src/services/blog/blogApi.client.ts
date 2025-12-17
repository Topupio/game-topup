import { clientApi } from "@/lib/http";
import { endpoints } from "@/config/api";
import { BlogPayload, BlogResponse, BlogListResponse } from "./types";
import { toFormData } from "@/utils/formData"; // Assuming we have this, or I'll inline a simple one like in games/banners

// Helper to convert complex blog payload to FormData
const createBlogFormData = (payload: BlogPayload): FormData => {
    const fd = new FormData();
    fd.append("title", payload.title);
    fd.append("slug", payload.slug);
    fd.append("category", payload.category);

    if (payload.description) fd.append("description", payload.description);

    // Complex fields as JSON strings
    if (payload.content) {
        fd.append("content", JSON.stringify(payload.content));
    }
    if (payload.seo) {
        fd.append("seo", JSON.stringify(payload.seo));
    }

    if (payload.coverImage) {
        fd.append("coverImage", payload.coverImage);
    }

    return fd;
};

export const blogApiClient = {
    async list(params?: { page?: number; limit?: number; category?: string }): Promise<BlogListResponse> {
        const { data } = await clientApi.get(endpoints.blogs.root, { params });
        return data;
    },

    async get(idOrSlug: string): Promise<BlogResponse> {
        const { data } = await clientApi.get(endpoints.blogs.byIdOrSlug(idOrSlug));
        return data;
    },

    async create(payload: BlogPayload): Promise<BlogResponse> {
        const fd = createBlogFormData(payload);
        const { data } = await clientApi.post(endpoints.blogs.root, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    async update(id: string, payload: Partial<BlogPayload>): Promise<BlogResponse> {
        // For partial update, we still largely need the same structure. 
        // Reusing the helper but typed generally.
        // We'll reconstruct the FormData manually here for partial precision if needed, 
        // or just accept that "Partial" means we check undefined.

        const fd = new FormData();
        if (payload.title) fd.append("title", payload.title);
        if (payload.slug) fd.append("slug", payload.slug);
        if (payload.category) fd.append("category", payload.category);
        if (payload.description) fd.append("description", payload.description);

        if (payload.content) fd.append("content", JSON.stringify(payload.content));
        if (payload.seo) fd.append("seo", JSON.stringify(payload.seo));
        if (payload.coverImage) fd.append("coverImage", payload.coverImage);

        const { data } = await clientApi.put(endpoints.blogs.byIdOrSlug(id), fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    async delete(id: string): Promise<{ success: true; message: string }> {
        const { data } = await clientApi.delete(endpoints.blogs.byIdOrSlug(id));
        return data;
    },
};
