import { gamesApiServer } from "@/services/games/gamesApi.server";
import { bannerApiServer } from "@/services/banner/bannerApi.server";
// import GameCategoryListing from "@/components/user/homePage/GameCategoryListing";
import CategorySwiperSection from "@/components/user/homePage/CategorySwiperSection";
import HeroCarousel from "@/components/user/homePage/HeroCarousel";
import HotGames from "@/components/user/homePage/HotGames";
import PopularGames from "@/components/user/homePage/PopularGames";
import CategoryQuickNav from "@/components/user/homePage/CategoryQuickNav";
import { CATEGORIES } from "@/lib/constants/checkoutTemplates";
import WhyChooseUs from "@/components/user/homePage/WhyChooseUs";

export default async function Page() {
    const [banners, homeRes, paymentCatRes, popularRes] = await Promise.all([
        bannerApiServer.listActive(),
        gamesApiServer.listHomeGames(),
        gamesApiServer.listPaymentCategories(),
        gamesApiServer.listPopular(),
    ]);

    const bannerData = banners.data || [];

    // Hot games: flatten + deduplicate from home categories
    const allGames = homeRes.categories.flatMap((cat) => cat.games);
    const seen = new Set<string>();
    const uniqueGames = allGames.filter((g) => {
        if (seen.has(g._id)) return false;
        seen.add(g._id);
        return true;
    });
    const hotGames = uniqueGames.slice(0, 8);

    // Payment categories for the category listing section
    const paymentCategories = paymentCatRes.categories;

    // Popular games (marked as popular in admin)
    const popularGames = popularRes.games || [];

    // All category names: hardcoded CATEGORIES first + any extra from API
    const apiCategoryNames = paymentCategories.map((c) => c.category);
    const allCategoryNames = [
        ...CATEGORIES,
        ...apiCategoryNames.filter(
            (c) => !CATEGORIES.some((p) => p.toLowerCase() === c.toLowerCase())
        ),
    ];

    return (
        <div className="py-20 bg-background overflow-x-hidden">
            <div className="max-w-7xl mx-auto lg:px-0 px-3">
                <HeroCarousel banners={bannerData} />
                <CategoryQuickNav categories={allCategoryNames} />
                <HotGames games={hotGames} />
                <PopularGames games={popularGames} />
                {/* <GameCategoryListing categories={paymentCategories} /> */}
                <CategorySwiperSection categories={paymentCategories} />
                <WhyChooseUs />
            </div>
        </div>
    );
}

