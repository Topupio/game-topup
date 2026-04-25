import { gamesApiServer } from "@/services/games/gamesApi.server";
import GameDetailsPage from "@/components/user/gameDetails/GameDetailsPage";
import { GameDetailResponse } from "@/lib/types/game";
import { notFound, permanentRedirect } from "next/navigation";
import { getGameUrl } from "@/lib/utils/getGameUrl";
import type { Metadata } from "next";
import { getCanonicalMetadata } from "@/lib/seo/canonical";

type CategoryGamePageProps = {
    params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({
    params,
}: CategoryGamePageProps): Promise<Metadata> {
    const { category, slug } = await params;

    return getCanonicalMetadata(`/${category}/${slug}`);
}

export default async function CategoryGamePage({
    params,
}: CategoryGamePageProps) {
    const { category, slug } = await params;
    console.log("slug", slug);

    let gameDetailResponse: GameDetailResponse;
    try {
        gameDetailResponse = (await gamesApiServer.get(
            slug
        )) as unknown as GameDetailResponse;
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("404")) {
            notFound();
        }
        throw error;
    }
    const gameDetails = gameDetailResponse.data;
    const checkoutTemplates = gameDetailResponse.checkoutTemplates || {};

    // Validate category matches — redirect if wrong
    const correctUrl = getGameUrl(gameDetails);
    if (`/${category}/${slug}` !== correctUrl) {
        permanentRedirect(correctUrl);
    }

    return (
        <GameDetailsPage
            gameDetails={gameDetails}
            checkoutTemplates={checkoutTemplates}
        />
    );
}
