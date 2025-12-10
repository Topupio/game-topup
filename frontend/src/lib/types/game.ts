import { Product } from "./product";

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
    category: string;
    imageUrl: string;
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

export type GameWithProducts = Game & {
    products: Product[];
};

export type CategoryGameSection = {
    category: string;
    games: Game[];
};

export type CategoryResponse = {
    success: boolean;
    categories: CategoryGameSection[];
    totalCategories: number;
};

export interface ApiResponse<T> {
    data: T;
}