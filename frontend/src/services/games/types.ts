import { Variant } from "@/lib/types/game";

export type GamePayload = {
    name: string;
    slug?: string;
    category: string;
    paymentCategory?: string;
    topupType?: string;
    description?: string;
    status: "active" | "inactive";
    regions: string[];
    variants: Variant[];
    image?: File | null;
    variantImages?: Record<number, File>;
    metaTitle?: string;
    metaDescription?: string;
};
