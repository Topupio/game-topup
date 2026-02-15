export interface RequiredField {
    fieldName: string;
    fieldKey: string;
    fieldType: "text" | "number" | "email" | "password" | "dropdown" | string;
    placeholder?: string;
    options?: string[];

    // UI-only helper (NOT sent to backend)
    optionsText?: string;

    required: boolean;
}

export interface RegionPricing {
    region: string;
    currency: string;
    symbol: string;
    price: number;
    discountedPrice: number;
}

export interface Variant {
    _id?: string;
    name: string;
    slug: string;
    quantity?: number | null;
    unit?: string;
    regionPricing: RegionPricing[];
    status: "active" | "inactive";
    isPopular: boolean;
    deliveryTime: string;
    imageUrl?: string | null;
    imagePublicId?: string | null;
    checkoutTemplate: string;
    checkoutTemplateOptions: Record<string, any>;
}

export type Game = {
    _id: string;
    name: string;
    slug: string;
    category: string;
    paymentCategory: string;
    topupType: string;
    imageUrl: string | null;
    imagePublicId?: string | null;
    description: string;
    regions: string[];
    variants: Variant[];
    status: "active" | "inactive";
    metaTitle?: string;
    metaDescription?: string;
};

export type GamesListResponse = {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    count: number;
    data: Game[];
};

/** @deprecated Use Game directly — variants are now embedded */
export type GameWithProducts = Game;

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
