
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

export interface Blog {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    content: BlogContentSection[];
    category: string;
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
    coverImage?: File; // For upload
    seo?: BlogSeo;
}

export interface BlogListResponse {
    success: boolean;
    count: number;
    totalPages: number;
    currentPage: number;
    data: Blog[];
}

export interface BlogResponse {
    success: boolean;
    data: Blog;
}
