import { clientApi } from "@/lib/http/index";
import { CheckoutTemplateDoc, CheckoutTemplateField } from "@/lib/types/game";

const BASE = "/api/checkout-templates";

export const checkoutTemplatesApiClient = {
    async getAll(): Promise<{ success: boolean; data: CheckoutTemplateDoc[] }> {
        const { data } = await clientApi.get(BASE);
        return data;
    },

    async getByKey(
        key: string
    ): Promise<{ success: boolean; data: CheckoutTemplateDoc }> {
        const { data } = await clientApi.get(`${BASE}/${key}`);
        return data;
    },

    async create(payload: {
        key: string;
        label: string;
        fields: CheckoutTemplateField[];
        enabled?: boolean;
    }): Promise<{ success: boolean; data: CheckoutTemplateDoc }> {
        const { data } = await clientApi.post(BASE, payload);
        return data;
    },

    async update(
        key: string,
        payload: {
            label?: string;
            fields?: CheckoutTemplateField[];
            enabled?: boolean;
        }
    ): Promise<{ success: boolean; data: CheckoutTemplateDoc }> {
        const { data } = await clientApi.put(`${BASE}/${key}`, payload);
        return data;
    },

    async remove(
        key: string
    ): Promise<{ success: boolean; message: string }> {
        const { data } = await clientApi.delete(`${BASE}/${key}`);
        return data;
    },
};
