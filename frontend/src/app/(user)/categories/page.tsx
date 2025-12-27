import { gamesApiServer } from "@/services/games/gamesApi.server";
import { Game } from "@/services/games";
import CategoryListingPage from "@/components/user/categories/CategoryListingPage";

export default async function CategoryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const category = typeof params.category === "string" ? params.category : undefined;
    const page = Number(params.page) || 1;
    const limit = 4;

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