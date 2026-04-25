import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import CategoryListingPage from "@/components/user/categories/CategoryListingPage";
import { gamesApiServer } from "@/services/games/gamesApi.server";
import {
  getCategoryPageHref,
  resolveCategoryFromRouteSlug,
} from "@/lib/utils/categoryPageUrl";
import { getCanonicalMetadata } from "@/lib/seo/canonical";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function titleCaseCategory(category: string): string {
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category: routeSlug } = await params;
  const query = await searchParams;
  const category = resolveCategoryFromRouteSlug(routeSlug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const label = titleCaseCategory(category);
  const page = Number(query.page) || 1;

  return {
    title: label,
    description: `Browse Topupio's ${label} catalog with fast delivery and secure checkout.`,
    ...getCanonicalMetadata(getCategoryPageHref(category, page)),
  };
}

export default async function CategorySlugPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: routeSlug } = await params;
  const query = await searchParams;
  const category = resolveCategoryFromRouteSlug(routeSlug);

  if (!category) {
    notFound();
  }

  const page = Number(query.page) || 1;
  const canonicalHref = getCategoryPageHref(category, page);
  const canonicalSlug = canonicalHref.slice(1).split("?")[0];

  if (routeSlug !== canonicalSlug) {
    permanentRedirect(canonicalHref);
  }

  const limit = 12;
  const res = await gamesApiServer.list({ page, limit, category });

  return (
    <CategoryListingPage
      games={res.data}
      currentPage={page}
      totalPages={res.totalPages}
    />
  );
}
