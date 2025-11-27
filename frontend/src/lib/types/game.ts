export type RequiredField = {
    fieldName: string;
    fieldKey: string;
    fieldType: "text" | "number" | "email" | "dropdown" | string;
    placeholder?: string;
    options: string[];
    required: boolean;
};

export type Game = {
    _id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    imagePublicId?: string | null;
    description: string;
    requiredFields: RequiredField[];
    status: "active" | "inactive";
};

export type GamesListResponse = {
    success: boolean;
    total: number;
    page: number;
    totalPages: number;
    count: number;
    data: Game[];
};

export interface ApiResponse<T> {
    data: T;
}