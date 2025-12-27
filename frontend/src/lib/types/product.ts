export interface Product {
    _id: string;

    gameId: string;

    name: string;
    slug: string;
    description: string;

    imageUrl: string | null;
    imagePublicId: string | null;

    price: number;
    discountedPrice: number;

    deliveryTime: string;
    status: "active" | "inactive";
    isPopular: boolean;

    metaTitle: string;
    metaDescription: string;

    createdAt: string;
    updatedAt: string;
}

export interface ProductPayload {
    gameId: string;

    name: string;
    slug?: string;

    description?: string;
    image?: File | string | null;

    price: number;
    discountedPrice: number;

    deliveryTime?: string;
    status: "active" | "inactive";
    isPopular?: boolean;

    metaTitle?: string;
    metaDescription?: string;
}

export interface ProductSingleResponse {
    success: boolean;
    data: Product;
}

export interface ProductsListResponse {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    count: number;
    data: Product[];
}
