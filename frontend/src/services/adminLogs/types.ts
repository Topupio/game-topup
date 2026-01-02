export interface AdminLog {
    _id: string;
    admin: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    action: string;
    module: string;
    targetId?: string;
    targetModel?: string;
    description: string;
    changes?: Record<string, any>;
    ip?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminLogResponse {
    success: boolean;
    data: {
        logs: AdminLog[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface AdminLogParams {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
    action?: string;
    admin?: string;
    startDate?: string | Date;
    endDate?: string | Date;
}
