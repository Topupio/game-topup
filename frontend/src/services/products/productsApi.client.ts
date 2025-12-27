'use client';

import { clientApi } from "@/lib/http";
import { endpoints } from "@/config/api";
import { toFormData } from "@/utils/convertToFormData";
import { Product, ProductPayload, ProductsListResponse, ProductSingleResponse } from "@/lib/types/product";

export const productsApiClient = {
    // GET /products
    async list(params?: Record<string, any>): Promise<ProductsListResponse> {
        const { data } = await clientApi.get(endpoints.products.root, { params });
        return data;
    },

    // GET /products/:id
    async get(id: string): Promise<ProductSingleResponse> {
        const { data } = await clientApi.get(endpoints.products.byId(id));
        return data;
    },

    // POST /products
    async create(payload: ProductPayload): Promise<Product> {
        const fd = toFormData(payload);
        const { data } = await clientApi.post(endpoints.products.root, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    // PUT /products/:id
    async update(id: string, payload: ProductPayload): Promise<Product> {
        const fd = toFormData(payload);
        const { data } = await clientApi.put(endpoints.products.byId(id), fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    // DELETE /products/:id
    async remove(id: string): Promise<{ message: string }> {
        const { data } = await clientApi.delete(endpoints.products.byId(id));
        return data;
    },
};
