export interface Banner {
    _id: string;
    title: string;
    imageUrl: string;
    imagePublicId: string;
    mobileImageUrl?: string;
    mobileImagePublicId?: string;
    link: string;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface BannerPayload {
    title?: string;
    link?: string;
    isActive?: boolean | string;
    order?: number | string;
    image?: File;
    mobileImage?: File;
}

export interface BannerListResponse {
    success: boolean;
    count: number;
    data: Banner[];
}

export interface BannerResponse {
    success: boolean;
    data: Banner;
}
