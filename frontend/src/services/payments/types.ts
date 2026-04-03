export interface PaymentSettings {
    upi: {
        enabled: boolean;
        upiId: string;
        payeeName: string;
        instructions: string;
        updatedAt?: string | null;
    };
}

export interface PaymentSettingsResponse {
    success: boolean;
    data: PaymentSettings;
    message?: string;
}

export interface PaymentSettingsUpdatePayload {
    upi: {
        enabled: boolean;
        upiId: string;
        payeeName: string;
        instructions: string;
    };
}

export interface UpiPaymentInitData {
    orderId: string;
    orderReference: string;
    upiId: string;
    payeeName: string;
    amount: number;
    currency: "INR";
    originalAmount: number;
    originalCurrency: string;
    note: string;
    reference: string;
    deepLink: string;
    qrPayload: string;
    instructions: string;
}

export interface UpiPaymentInitResponse {
    success: boolean;
    data: UpiPaymentInitData;
    message?: string;
}
