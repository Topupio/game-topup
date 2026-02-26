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

    async update(
        key: string,
        payload: { label?: string; fields?: CheckoutTemplateField[] }
    ): Promise<{ success: boolean; data: CheckoutTemplateDoc }> {
        const { data } = await clientApi.put(`${BASE}/${key}`, payload);
        return data;
    },
};
