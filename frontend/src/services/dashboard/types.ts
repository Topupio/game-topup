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

/**
 * Recent order returned by dashboard
 */
export interface DashboardOrder {
    _id: string;
    orderStatus: "pending" | "processing" | "completed";
    totalAmount: number;
    createdAt: string;

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

    admin: DashboardAdmin;
}

// ===== Main Response Type =====

export interface DashboardResponse {
    orders: DashboardOrdersStats;
    users: DashboardUsersStats;
    revenue: DashboardRevenueStats;

    recentOrders: DashboardOrder[];
    recentActivity: DashboardActivity[];
}
