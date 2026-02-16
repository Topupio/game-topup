import { gamesApiServer } from "@/services/games/gamesApi.server";
import GameDetailsPage from "@/components/user/gameDetails/GameDetailsPage";

// Server component: fetch data server-side as needed and render the interactive client
export default async function GameSlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const gameDetailResponse = await gamesApiServer.get(slug);
    const gameDetails = gameDetailResponse.data;

    return <GameDetailsPage gameDetails={gameDetails} />;
}