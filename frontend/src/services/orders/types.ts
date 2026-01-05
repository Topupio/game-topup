export interface Order {
    _id: string;
    orderId: string;
    user: any; // Will be populated with User object
    game: any; // Will be populated with Game object
    product: string;
    amount: number;
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    paymentMethod: "razorpay" | "stripe" | "wallet" | "binancePay";
    userInputs: {
        label: string;
        value: string;
    }[];
    orderStatus: "pending" | "paid" | "processing" | "completed" | "cancelled" | "failed";
    adminNote?: string;
    completionProof?: string;
    productSnapshot: {
        name: string;
        price: number;
        discountedPrice?: number;
        deliveryTime: string;
    };
    tracking: {
        status: string;
        message: string;
        at: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

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

export interface OrderParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    [key: string]: any;
}
