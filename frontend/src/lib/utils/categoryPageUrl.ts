import { CATEGORY_SLUG_MAP, categoryToSlug } from "@/lib/constants/checkoutTemplates";

export const CATEGORY_PAGE_SLUG_MAP: Record<string, string> = {
  "uid-top-up": "uid instant top-up",
  "login-top-up": "login top-up",
  "live-apps-top-up": "live apps top-up",
  "gift-cards": "gift cards",
  "ai-subscriptions": "ai & subscriptions",
};

const CATEGORY_NAME_TO_PAGE_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_PAGE_SLUG_MAP).map(([slug, name]) => [name, slug])
);

function normalizeCategoryName(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveCategoryFromRouteSlug(slug: string): string | null {
  if (!slug) return null;

  return (
    CATEGORY_PAGE_SLUG_MAP[slug] ||
    CATEGORY_SLUG_MAP[slug] ||
    null
  );
}

export function categoryToPageSlug(category: string): string {
  const normalizedCategory = normalizeCategoryName(category);

  return (
    CATEGORY_NAME_TO_PAGE_SLUG[normalizedCategory] ||
    categoryToSlug(normalizedCategory)
  );
}

export function getCategoryPageHref(category: string, page = 1): string {
  const pathname = `/${categoryToPageSlug(category)}`;
  if (page <= 1) return pathname;

  return `${pathname}?page=${page}`;
}

export function getCategoriesCatalogHref(page = 1): string {
  if (page <= 1) return "/categories";

  return `/categories?page=${page}`;
}

export function getSelectedCategoryFromLocation(
  pathname: string,
  searchParams: { get(name: string): string | null }
): string {
  const routeSlug = pathname.split("/").filter(Boolean)[0] || "";
  const routeCategory =
    routeSlug && routeSlug !== "categories"
      ? resolveCategoryFromRouteSlug(routeSlug)
      : null;

  if (routeCategory) return routeCategory;

  const queryCategory = searchParams.get("category") || "";
  return resolveCategoryFromRouteSlug(queryCategory) || "";
}
