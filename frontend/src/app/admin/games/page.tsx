import { gamesApiServer } from "@/services/games/gamesApi.server";
import AdminGamePage from "@/components/admin/games/AdminGamePage";

const GamesPage = async () => {
    const games = await gamesApiServer.list();
    const data = games.data || [];

    return <AdminGamePage initialItems={data} />
}

export default GamesPage;