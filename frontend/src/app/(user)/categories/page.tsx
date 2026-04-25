import type { Metadata } from "next";
import { gamesApiServer } from "@/services/games/gamesApi.server";
import { Game } from "@/services/games";
import CategoryListingPage from "@/components/user/categories/CategoryListingPage";
import { permanentRedirect } from "next/navigation";
import {
    getCategoriesCatalogHref,
    getCategoryPageHref,
    resolveCategoryFromRouteSlug,
} from "@/lib/utils/categoryPageUrl";
import { getCanonicalMetadata } from "@/lib/seo/canonical";

type CategoryPageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
    searchParams,
}: CategoryPageProps): Promise<Metadata> {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    return {
        title: {
            absolute: "Buy Game Top-Ups, Gift Cards & AI Subscriptions in India | Topupio",
        },
        description: "Browse all Topupio game categories, gift cards, and digital subscriptions in one catalog.",
        ...getCanonicalMetadata(getCategoriesCatalogHref(page)),
    };
}

export default async function CategoryPage({
    searchParams,
}: CategoryPageProps) {
    const params = await searchParams;
    const categorySlug = typeof params.category === "string" ? params.category : undefined;
    const page = Number(params.page) || 1;
    const limit = 12;

    if (categorySlug) {
        const category = resolveCategoryFromRouteSlug(categorySlug);
        if (category) {
            permanentRedirect(getCategoryPageHref(category, page));
        }
    }

    const res = await gamesApiServer.list({ page, limit });

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
