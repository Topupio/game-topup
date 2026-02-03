import { gamesApiServer } from "@/services/games/gamesApi.server";
import { bannerApiServer } from "@/services/banner/bannerApi.server";
import { productsApiServer } from "@/services/products/productsApi.server";
import GameCategoryListing from "@/components/user/homePage/GameCategoryListing";
import HeroCarousel from "@/components/user/homePage/HeroCarousel";
import HotProducts from "@/components/user/homePage/HotProducts";

export default async function Page() {
    const banners = await bannerApiServer.listActive();
    const bannerData = banners.data || [];

    const popularProductsRes = await productsApiServer.listPopular();
    const popularProducts = popularProductsRes.data || [];

    const res = await gamesApiServer.listHomeGames();
    const data = res.categories;

    return (
        <div className="py-20 bg-background overflow-x-hidden">
            <div className="max-w-7xl mx-auto lg:px-0 px-3">
                <HeroCarousel banners={bannerData} />
                <HotProducts products={popularProducts} />
                <GameCategoryListing categories={data} />
            </div>
        </div>
    );
}
