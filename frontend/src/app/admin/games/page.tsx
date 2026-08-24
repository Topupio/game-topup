import { gamesApiServer } from "@/services/games/gamesApi.server";
import AdminGamePage from "@/components/admin/games/AdminGamePage";

const GamesPage = async () => {
    // Admin must still see disabled games; the storefront default hides them.
    const games = await gamesApiServer.list({ includeInactive: true });

    return <AdminGamePage initialData={games} />
}

export default GamesPage;