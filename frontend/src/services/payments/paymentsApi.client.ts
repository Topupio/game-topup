import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import {
    PaymentSettingsResponse,
    PaymentSettingsUpdatePayload,
    UpiPaymentInitResponse,
} from "./types";

export const paymentsApiClient = {
    async createPayPalOrder(orderId: string) {
        const { data } = await clientApi.post(
            endpoints.payments.paypalCreateOrder,
            { orderId }
        );
        return data as {
            success: boolean;
            paypalOrderId: string;
            amount?: number;
            currency?: "USD";
            breakdown?: Record<string, unknown>;
        };
    },

    async capturePayPalOrder(paypalOrderId: string, orderId: string) {
        const { data } = await clientApi.post(
            endpoints.payments.paypalCaptureOrder,
            { paypalOrderId, orderId }
        );
        return data as {
            success: boolean;
            data: Record<string, unknown>;
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

    async initiateUpiPayment(orderId: string): Promise<UpiPaymentInitResponse> {
        const { data } = await clientApi.post(
            endpoints.payments.upiInitiate,
            { orderId }
        );
        return data;
    },

    async submitUtrNumber(orderId: string, utrNumber: string): Promise<{ success: boolean; message: string }> {
        const { data } = await clientApi.post(
            endpoints.payments.upiSubmitUtr,
            { orderId, utrNumber }
        );
        return data;
    },

    async getPaymentSettings(): Promise<PaymentSettingsResponse> {
        const { data } = await clientApi.get(endpoints.payments.settings);
        return data;
    },

    async updatePaymentSettings(payload: PaymentSettingsUpdatePayload): Promise<PaymentSettingsResponse> {
        const { data } = await clientApi.put(endpoints.payments.settings, payload);
        return data;
    },
};
