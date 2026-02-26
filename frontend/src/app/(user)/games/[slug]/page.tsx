import { gamesApiServer } from "@/services/games/gamesApi.server";
import GameDetailsPage from "@/components/user/gameDetails/GameDetailsPage";
import { GameDetailResponse } from "@/lib/types/game";

// Server component: fetch data server-side as needed and render the interactive client
export default async function GameSlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const gameDetailResponse = (await gamesApiServer.get(
        slug
    )) as unknown as GameDetailResponse;
    const gameDetails = gameDetailResponse.data;
    const checkoutTemplates = gameDetailResponse.checkoutTemplates || {};

    return (
        <GameDetailsPage
            gameDetails={gameDetails}
            checkoutTemplates={checkoutTemplates}
        />
    );
}