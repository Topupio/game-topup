import { gamesApiServer } from "@/services/games/gamesApi.server";
import GameDetailsPage from "@/components/user/gameDetails/GameDetailsPage";
import { GameDetailResponse } from "@/lib/types/game";
import { permanentRedirect } from "next/navigation";
import { getGameUrl } from "@/lib/utils/getGameUrl";

export default async function CategoryGamePage({
    params,
}: {
    params: Promise<{ category: string; slug: string }>;
}) {
    const { category, slug } = await params;

    const gameDetailResponse = (await gamesApiServer.get(
        slug
    )) as unknown as GameDetailResponse;
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
