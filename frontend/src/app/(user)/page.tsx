import { gamesApiServer } from "@/services/games/gamesApi.server";
import { bannerApiServer } from "@/services/banner/bannerApi.server";
import GameCategoryListing from "@/components/user/homePage/GameCategoryListing";
import HeroCarousel from "@/components/user/homePage/HeroCarousel";
import HotGames from "@/components/user/homePage/HotGames";

export default async function Page() {
    const banners = await bannerApiServer.listActive();
    const bannerData = banners.data || [];

    const res = await gamesApiServer.listHomeGames();
    const data = res.categories;

    // Flatten all games from categories and deduplicate for the carousel
    const allGames = data.flatMap((cat) => cat.games);
    const seen = new Set<string>();
    const uniqueGames = allGames.filter((g) => {
        if (seen.has(g._id)) return false;
        seen.add(g._id);
        return true;
    });
    const hotGames = uniqueGames.slice(0, 8);

    return (
        <div className="py-20 bg-background overflow-x-hidden">
            <div className="max-w-7xl mx-auto lg:px-0 px-3">
                <HeroCarousel banners={bannerData} />
                <HotGames games={hotGames} />
                <GameCategoryListing categories={data} />
            </div>
        </div>
    );
}
