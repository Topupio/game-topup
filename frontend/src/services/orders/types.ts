// ===== Enums & Shared Types =====

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "razorpay" | "stripe" | "wallet" | "binancePay" | "paypal";

export type OrderStatus =
    | "pending"
    | "paid"
    | "processing"
    | "completed"
    | "cancelled"
    | "failed";

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
}

// ===== Core Order Model =====

export interface Order {
    _id: string;
    orderId: string;

    user: UserSummary;
    game: GameSummary;

    product: string;
    amount: number;
    currency?: string;

    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;

    userInputs: {
        label: string;
        value: string | number;
    }[];

    orderStatus: OrderStatus;

    adminNote?: string;
    completionProof?: string;

    productSnapshot: {
        name: string;
        price: number;
        discountedPrice?: number;
        deliveryTime: string;
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

// ===== Request & Query Types =====

export interface OrderParams extends Record<string, unknown> {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
}

// ===== Admin Update Payload =====

export type AdminOrderUpdatePayload = Partial<{
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    adminNote: string;
    completionProof: string;
}>;

// ===== Create Order Payload =====

export interface CreateOrderPayload {
    gameId: string;
    productId: string;
    qty: number;
    userInputs: { label: string; value: string | number }[];
    currency?: string;
    displayCurrency?: string;
}
