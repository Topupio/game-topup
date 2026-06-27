// ===== Enums & Shared Types =====

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "razorpay" | "stripe" | "wallet" | "binancePay" | "paypal" | "nowpayments" | "upi";

export type OrderStatus =
    | "pending"
    | "paid"
    | "processing"
    | "completed"
    | "cancelled"
    | "failed"
    | "expired";

export type AdminOrderQueue = OrderStatus | "upi_review" | "";

// ===== Lightweight Related Models =====

export interface UserSummary {
    _id: string;
    name: string;
    email: string;
}

export interface GameSummary {
    _id: string;
    name: string;
    imageUrl?: string;
    checkoutTemplate?: string;
    category?: string;
}

// ===== Structured Delivery =====

export type DeliveryKind = "credentials" | "code";

export interface DeliveryItem {
    label: string;
    value: string;
    secret?: boolean;
}

export interface Delivery {
    kind: DeliveryKind;
    intro?: string;
    items?: DeliveryItem[];
    code?: string;
    steps?: string[];
    notice?: string;
    validUntil?: string;
    deliveredAt?: string;
}

// ===== Core Order Model =====

export interface Order {
    _id: string;
    orderId: string;

    user: UserSummary;
    game: GameSummary;

    product: string;
    amount: number;
    quantity?: number;
    currency?: string;

    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;

    userInputs: {
        label: string;
        value: string | number;
    }[];

    orderStatus: OrderStatus;

    paymentInfo?: {
        transactionId?: string;
        utrNumber?: string;
        utrSubmittedAt?: string;
        paymentGatewayResponse?: {
            upi?: {
                upiId: string;
                payeeName: string;
                amount: number;
                currency: string;
                originalAmount: number;
                originalCurrency: string;
                reference: string;
            };
        };
    };

    paymentBreakdown?: {
        paypal?: {
            subtotalAmount: number;
            subtotalCurrency: string;
            subtotalUsd: number;
            processingFeeUsd: number;
            totalUsd: number;
            processingRate: number;
            minOrderUsd: number;
        };
    };

    adminNote?: string;
    adminNoteUpdatedAt?: string;
    adminNoteReadAt?: string;
    completionProof?: string;

    delivery?: Delivery;

    productSnapshot: {
        name: string;
        price: number;
        discountedPrice?: number;
        deliveryTime: string;
        qty?: number;
    };

    tracking: {
        status: OrderStatus;
        message: string;
        at: string;
    }[];

    createdAt: string;
    updatedAt: string;
}

// ===== API Response Types =====

export interface OrderResponse {
    success: boolean;
    data: Order;
    message?: string;
}

export interface GameReview {
    _id: string;
    user: string;
    game: string;
    order: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewEligibleOrderResponse {
    success: boolean;
    data: {
        order: Order;
    } | null;
    message?: string;
}

export interface GameReviewResponse {
    success: boolean;
    data: GameReview;
    message?: string;
}

export interface ListOrderResponse {
    success: boolean;
    data: {
        orders: Order[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface PublicRecentOrder {
    productName: string;
    gameName: string | null;
    orderStatus: Extract<OrderStatus, "paid" | "processing" | "completed">;
    createdAt: string;
}

export interface PublicRecentOrdersResponse {
    success: boolean;
    data: PublicRecentOrder[];
}

export interface AdminOrderMessage {
    _id: string;
    orderId: string;
    adminNote: string;
    productName: string;
    gameName: string | null;
    updatedAt: string;
    adminNoteUpdatedAt: string;
    adminNoteReadAt: string | null;
    adminNoteClearedAt: string | null;
    isRead: boolean;
}

export interface AdminOrderMessagesResponse {
    success: boolean;
    data: AdminOrderMessage[];
}

export interface MarkAdminMessageReadResponse {
    success: boolean;
    data: AdminOrderMessage;
    message?: string;
}

export interface ClearAdminMessagesResponse {
    success: boolean;
    data: [];
    message?: string;
}

// ===== Request & Query Types =====

export interface OrderParams extends Record<string, unknown> {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    queue?: "upi_review";
    search?: string;
}

// ===== Admin Update Payload =====

export type AdminOrderUpdatePayload = Partial<{
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    adminNote: string;
    completionProof: string;
    delivery: Delivery | null;
}>;

// ===== Create Order Payload =====

export interface CreateOrderPayload {
    gameId: string;
    productId: string;
    qty: number;
    userInputs: { label: string; value: string | number }[];
}

export interface SubmitOrderReviewPayload {
    rating: number;
    comment?: string;
}
