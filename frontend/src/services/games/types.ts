import { Game } from "@/lib/types/game";

export type GamePayload = {
    name: string;
    slug?: string;
    description?: string;
    status: "active" | "inactive";
    requiredFields: Game["requiredFields"];
    image?: File | null;
};
