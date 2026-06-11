
export interface BlogContentSection {
    contentTitle: string;
    contentDescription: string;
    _id?: string;
}

export interface BlogSeo {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
}

export interface RelatedBlogGame {
    _id: string;
    name: string;
    slug: string;
    category: string;
    paymentCategory?: string;
    imageUrl?: string | null;
}

export interface Blog {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    content: BlogContentSection[];
    category: string;
    relatedGames?: Array<string | RelatedBlogGame>;
    coverImage: string;
    coverImageId?: string;
    seo?: BlogSeo;
    createdAt: string;
    updatedAt: string;
}

export interface BlogPayload {
    title: string;
    slug: string;
    description?: string;
    content: BlogContentSection[];
    category: string;
    relatedGames?: string[];
    coverImage?: File; // For upload
    seo?: BlogSeo;
}

export interface BlogListResponse {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    count: number;
    data: Blog[];
}

export interface BlogResponse {
    success: boolean;
    data: Blog;
}
