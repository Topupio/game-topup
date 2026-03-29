import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";

export const paymentsApiClient = {
    async createPayPalOrder(orderId: string) {
        const { data } = await clientApi.post(
            endpoints.payments.paypalCreateOrder,
            { orderId }
        );
        return data as { success: boolean; paypalOrderId: string };
    },

    async capturePayPalOrder(paypalOrderId: string, orderId: string) {
        const { data } = await clientApi.post(
            endpoints.payments.paypalCaptureOrder,
            { paypalOrderId, orderId }
        );
        return data as {
            success: boolean;
            data: any;
            message: string;
            code?: string;
        };
    },

    async createNowPaymentsInvoice(orderId: string) {
        const { data } = await clientApi.post(
            endpoints.payments.nowpaymentsCreateInvoice,
            { orderId }
        );
        return data as { success: boolean; invoiceUrl: string; invoiceId: string };
    },
};
