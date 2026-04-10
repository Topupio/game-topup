import { Variant } from "@/lib/types/game";

export type GamePayload = {
    name: string;
    slug?: string;
    category: string;
    paymentCategory?: string;
    topupType?: string;
    description?: string;
    richDescription?: string;
    status: "active" | "inactive";
    isPopular?: boolean;
    regions: string[];
    checkoutTemplate?: string;
    checkoutTemplateOptions?: Record<string, any>;
    variants: Variant[];
    image?: File | null;
    variantImages?: Record<number, File>;
    faqs?: { question: string; answer: string }[];
    metaTitle?: string;
    metaDescription?: string;
};
