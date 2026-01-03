export interface User {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    status: "active" | "blocked";
    lastLoginAt?: string;
    createdAt: string;
    isVerified: boolean;
}

export interface UserResponse {
    success: boolean;
    data: {
        users: User[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    message?: string;
}

export interface UserParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    verified?: string; // passing as string 'true'/'false' for query param simplicity
}
