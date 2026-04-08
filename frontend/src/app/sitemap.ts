import type { MetadataRoute } from "next";
import { endpoints, getApiBase } from "@/config/api";
import { getAbsoluteUrl } from "@/lib/seo/site";
import { getGameUrl } from "@/lib/utils/getGameUrl";
import { CATEGORY_PAGE_SLUG_MAP } from "@/lib/utils/categoryPageUrl";

const SITEMAP_REVALIDATE_SECONDS = 60 * 60;
const PAGINATION_LIMIT = 200;

type PaginatedResponse<T> = {
  data: T[];
  totalPages?: number;
};

type SitemapGame = {
  slug: string;
  paymentCategory?: string;
  imageUrl?: string | null;
};

type SitemapBlog = {
  slug: string;
  updatedAt?: string;
  coverImage?: string | null;
};

async function fetchSeoPage<T>(
  path: string,
  params: Record<string, string | number>
): Promise<PaginatedResponse<T>> {
  const apiBase = getApiBase();
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_BASE is required to generate sitemap data.");
  }

  const url = new URL(path, `${apiBase}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Sitemap fetch failed for ${path}: ${response.status}`);
  }

  return response.json();
}

async function fetchAllSeoItems<T>(path: string): Promise<T[]> {
  const firstPage = await fetchSeoPage<T>(path, {
    page: 1,
    limit: PAGINATION_LIMIT,
  });

  const items = [...(firstPage.data || [])];
  const totalPages = Math.max(1, firstPage.totalPages || 1);

  if (totalPages === 1) return items;

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchSeoPage<T>(path, {
        page: index + 2,
        limit: PAGINATION_LIMIT,
      })
    )
  );

  for (const page of remainingPages) {
    items.push(...(page.data || []));
  }

  return items;
}

function buildSitemapEntry(
  pathname: string,
  options?: Omit<MetadataRoute.Sitemap[number], "url">
): MetadataRoute.Sitemap[number] {
  return {
    url: getAbsoluteUrl(pathname),
    ...options,
  };
}

function buildCategoryEntries(): MetadataRoute.Sitemap {
  return Object.keys(CATEGORY_PAGE_SLUG_MAP).map((categorySlug) => ({
      url: getAbsoluteUrl(`/${categorySlug}`),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
}

async function getGameEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const games = await fetchAllSeoItems<SitemapGame>(endpoints.games.root);

    return games.map((game) =>
      buildSitemapEntry(getGameUrl(game), {
        changeFrequency: "weekly",
        priority: 0.8,
        images: game.imageUrl ? [game.imageUrl] : undefined,
      })
    );
  } catch (error) {
    console.error("Failed to build game sitemap entries", error);
    return [];
  }
}

async function getBlogEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const blogs = await fetchAllSeoItems<SitemapBlog>(endpoints.blogs.root);

    return blogs.map((blog) =>
      buildSitemapEntry(`/blogs/${blog.slug}`, {
        lastModified: blog.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        images: blog.coverImage ? [blog.coverImage] : undefined,
      })
    );
  } catch (error) {
    console.error("Failed to build blog sitemap entries", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    buildSitemapEntry("/", {
      changeFrequency: "daily",
      priority: 1,
    }),
    buildSitemapEntry("/blogs", {
      changeFrequency: "daily",
      priority: 0.9,
    }),
    buildSitemapEntry("/categories", {
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    buildSitemapEntry("/contact", {
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    buildSitemapEntry("/faq", {
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    buildSitemapEntry("/privacy-policy", {
      changeFrequency: "yearly",
      priority: 0.3,
    }),
    buildSitemapEntry("/refund-policy", {
      changeFrequency: "yearly",
      priority: 0.3,
    }),
    buildSitemapEntry("/terms-and-conditions", {
      changeFrequency: "yearly",
      priority: 0.3,
    }),
  ];

  const [gameEntries, blogEntries] = await Promise.all([
    getGameEntries(),
    getBlogEntries(),
  ]);

  return [
    ...staticEntries,
    ...buildCategoryEntries(),
    ...gameEntries,
    ...blogEntries,
  ];
}
