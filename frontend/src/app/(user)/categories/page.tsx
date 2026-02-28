import { gamesApiServer } from "@/services/games/gamesApi.server";
import { Game } from "@/services/games";
import CategoryListingPage from "@/components/user/categories/CategoryListingPage";
import { slugToCategory } from "@/lib/constants/checkoutTemplates";

export default async function CategoryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const categorySlug = typeof params.category === "string" ? params.category : undefined;
    const category = categorySlug ? slugToCategory(categorySlug) : undefined;
    const page = Number(params.page) || 1;
    const limit = 12;

    const res = await gamesApiServer.list({ page, limit, category });

    const games: Game[] = res.data;
    const totalPages: number = res.totalPages;

    return (
        <CategoryListingPage
            games={games}
            currentPage={page}
            totalPages={totalPages}
        />
    );
}