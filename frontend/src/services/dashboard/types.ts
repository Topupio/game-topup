export interface DashboardStats {
    orders: {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        today: number;
    };
    users: {
        total: number;
        blocked: number;
        newToday: number;
    };
    revenue: {
        total: number;
        today: number;
        thisWeek: number;
    };
}

// ===== Sub-types =====

export interface DashboardOrdersStats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    today: number;
}

export interface DashboardUsersStats {
    total: number;
    blocked: number;
    newToday: number;
}

export interface DashboardRevenueStats {
    total: number;
    today: number;
    thisWeek: number;
}

/**
 * Minimal user shape used in populated recentOrders
 * Extend if you need more fields on frontend
 */
export interface DashboardUser {
    _id: string;
    name: string;
    email: string;
}

/**
 * Minimal product shape used in populated recentOrders
 */
export interface DashboardProduct {
    _id: string;
    name: string;
    price: number;
}

export interface DashboardGame {
    _id: string;
    name: string;
}

export type OrderStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Recent order returned by dashboard
 */
export interface DashboardOrder {
    _id: string;
    orderId: string;
    orderStatus: OrderStatus;
    amount: number;
    createdAt: string;
    game: DashboardGame;
    user: DashboardUser;
    product: DashboardProduct;
}

/**
 * Admin referenced in activity log
 */
export interface DashboardAdmin {
    _id: string;
    name: string;
    email: string;
}

/**
 * Recent admin activity log
 */
export interface DashboardActivity {
    _id: string;
    action: string;
    createdAt: string;
    description: string;
    module: string;

    admin: DashboardAdmin;
}

export interface DashboardActionRequired {
    ordersToProcess: number;
    stuckOrders: number;
    pendingPayments: number;
    failedPaymentsToday: number;
    unverifiedUsers: number;
    blockedUsers: number;
}

// ===== Main Response Type =====

export interface DashboardResponse {
    orders: DashboardOrdersStats;
    users: DashboardUsersStats;
    revenue: DashboardRevenueStats;
    actionRequired: DashboardActionRequired;

    recentOrders: DashboardOrder[];
    recentActivity: DashboardActivity[];
}
