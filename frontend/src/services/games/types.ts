import { Variant } from "@/lib/types/game";

export type GamePayload = {
    name: string;
    slug?: string;
    category: string;
    topupType?: string;
    description?: string;
    status: "active" | "inactive";
    regions: string[];
    variants: Variant[];
    image?: File | null;
    metaTitle?: string;
    metaDescription?: string;
};
