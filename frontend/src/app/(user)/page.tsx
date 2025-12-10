import { gamesApiServer } from "@/services/games";
import GameCategoryListing from "@/components/user/homePage/GameCategoryListing";
import HeroCarousel from "@/components/user/homePage/HeroCarousel";
import HotProducts from "@/components/user/homePage/HotProducts";
import { Game } from "@/lib/types/game";

export default async function Page() {
    // Here you will fetch real games from DB or API
    const games = await gamesApiServer.list();
    const gameData: Game[] = games.data || [];

    const res = await gamesApiServer.listHomeGames();
    const data = res.categories;

    console.log("Home Page Games:", data);

    return (
        <div className="py-20 bg-linear-to-b from-primary to-primary/90">
            <div className="max-w-7xl mx-auto lg:px-0 px-3">
                <HeroCarousel games={gameData} />
                <HotProducts games={gameData} />
                <GameCategoryListing categories={data} />
            </div>
        </div>
    );
}
