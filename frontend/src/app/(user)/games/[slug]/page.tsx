import { gamesApiServer } from "@/services/games/gamesApi.server";
import GameDetailsClient from "@/components/user/gameDetails/GameDetailsClient";

// Server component: fetch data server-side as needed and render the interactive client
export default async function GameDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const gameDetailResponse = await gamesApiServer.get(slug);
    const gameDetails = gameDetailResponse.data;

    return <GameDetailsClient gameDetails={gameDetails} />;
}