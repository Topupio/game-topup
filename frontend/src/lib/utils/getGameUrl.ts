import { categoryToSlug } from "@/lib/constants/checkoutTemplates";

export function getGameUrl(game: { slug: string; paymentCategory?: string }): string {
    if (!game.paymentCategory) return `/games/${game.slug}`;
    return `/${categoryToSlug(game.paymentCategory)}/${game.slug}`;
}
