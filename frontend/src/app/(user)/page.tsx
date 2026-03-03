import { gamesApiServer } from "@/services/games/gamesApi.server";
import { bannerApiServer } from "@/services/banner/bannerApi.server";
// import GameCategoryListing from "@/components/user/homePage/GameCategoryListing";
import CategorySwiperSection from "@/components/user/homePage/CategorySwiperSection";
import HeroCarousel from "@/components/user/homePage/HeroCarousel";
import PopularGames from "@/components/user/homePage/PopularGames";
import CategoryQuickNav from "@/components/user/homePage/CategoryQuickNav";
import { CATEGORIES } from "@/lib/constants/checkoutTemplates";
import WhyChooseUs from "@/components/user/homePage/WhyChooseUs";

export default async function Page() {
    const [banners, paymentCatRes, popularRes] = await Promise.all([
        bannerApiServer.listActive(),
        gamesApiServer.listPaymentCategories(),
        gamesApiServer.listPopular(),
    ]);

    const bannerData = banners.data || [];

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
                <PopularGames games={popularGames} />
                {/* <GameCategoryListing categories={paymentCategories} /> */}
                <CategorySwiperSection categories={paymentCategories} />
                <WhyChooseUs />
            </div>
        </div>
    );
}

