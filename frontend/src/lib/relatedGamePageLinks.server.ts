import { gamesApiServer } from "@/services/games/gamesApi.server";
import { blogApiServer } from "@/services/blog/blogApi.server";
import { categoryToSlug } from "@/lib/constants/checkoutTemplates";
import type { Game } from "@/lib/types/game";
import type { Blog } from "@/services/blog/types";

export type RelatedGamePageLinks = {
    relatedGames: Game[];
    relatedBlogs: Blog[];
};

const RELATED_GAMES_LIMIT = 7;
const RELATED_BLOGS_LIMIT = 3;

function getRelatedCategory(game: Game) {
    return (game.paymentCategory || game.category || "").trim();
}

async function getRelatedGames(game: Game, category: string): Promise<Game[]> {
    if (!category) return [];

    try {
        const response = await gamesApiServer.list({
            page: 1,
            limit: 12,
            category: categoryToSlug(category),
            status: "active",
            sort: "createdAt",
            order: "desc",
        });

        return (response.data || [])
            .filter((item) => item._id !== game._id && item.slug !== game.slug)
            .slice(0, RELATED_GAMES_LIMIT);
    } catch (error) {
        console.error("Failed to load related top-ups", error);
        return [];
    }
}

async function getRelatedBlogs(category: string): Promise<Blog[]> {
    if (!category) return [];

    try {
        const response = await blogApiServer.list({
            page: 1,
            limit: RELATED_BLOGS_LIMIT,
            category,
        });

        return (response.data || []).slice(0, RELATED_BLOGS_LIMIT);
    } catch (error) {
        console.error("Failed to load related blogs", error);
        return [];
    }
}

export async function getRelatedGamePageLinks(
    game: Game
): Promise<RelatedGamePageLinks> {
    const category = getRelatedCategory(game);
    const [relatedGames, relatedBlogs] = await Promise.all([
        getRelatedGames(game, category),
        getRelatedBlogs(category),
    ]);

    return { relatedGames, relatedBlogs };
}
