import { serverApi } from "@/lib/http/server";
import { endpoints } from "@/config/api";
import { Product, ProductPayload, ProductsListResponse, ProductSingleResponse } from "@/lib/types/product";

export const productsApiServer = {
    async list(): Promise<ProductsListResponse> {
        return serverApi.get(endpoints.products.root);
    },

    async get(slug: string): Promise<ProductSingleResponse> {
        return serverApi.get(endpoints.products.byId(slug));
    },

    async create(payload: ProductPayload): Promise<Product> {
        return serverApi.post(endpoints.products.root, payload);
    },

    async update(slug: string, payload: ProductPayload): Promise<Product> {
        return serverApi.post(endpoints.products.byId(slug), payload, {
            method: "PUT",
        });
    },

    async remove(slug: string): Promise<{ success: boolean }> {
        return serverApi.post(endpoints.products.byId(slug), null, {
            method: "DELETE",
        });
    }
}