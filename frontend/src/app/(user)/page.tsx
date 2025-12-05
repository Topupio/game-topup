import GameCardsBox from "@/components/user/homePage/GameCardsBox";
import GameCategoryListing from "@/components/user/homePage/GameCategoryListing";
import HeroCarousel from "@/components/user/homePage/HeroCarousel";
import HotProducts from "@/components/user/homePage/HotProducts";
import { Game } from "@/lib/types/game";

export default async function Page() {
    // Here you will fetch real games from DB or API
    const games: Game[] = [
        {
            _id: "1",
            name: "PUBG",
            slug: "pubg",
            imageUrl: "https://shop.ldrescdn.com/rms/ld-space/process/img/681df51d32b4497086f39b9377e08df61754293425.webp?x-oss-process=image/resize,m_lfit,w_1892,h_640/format,webp",
            description: "Battle Royale Legend",
            requiredFields: [],
            status: "active",
        },
        {
            _id: "2",
            name: "Free Fire",
            slug: "free-fire",
            imageUrl: "https://image.vpayfast.com/image/2025/08/20/2c59fe9d042f416996de6141a5e347d7.png",
            description: "Fast-paced Action",
            requiredFields: [],
            status: "active",
        },
        {
            _id: "3",
            name: "FIFA 24",
            slug: "fifa-24",
            imageUrl: "https://shop.ldrescdn.com/rms/ld-space/process/img/e3a161eda1574836a8096ccd5760bdbc1762831799.webp?x-oss-process=image/resize,m_lfit,w_1892,h_640/format,webp",
            description: "Football Simulation",
            requiredFields: [],
            status: "active",
        }
    ];

    return (
        <div className="py-20 bg-linear-to-b from-primary to-primary/90">
            <div className="max-w-7xl mx-auto lg:px-0 px-3">
                <HeroCarousel games={games} />
                <HotProducts games={games} />
                <GameCategoryListing />
            </div>
        </div>
    );
}
