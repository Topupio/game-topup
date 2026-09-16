import type { Game, RegionPricing, Variant } from "@/lib/types/game";
import { getAbsoluteUrl } from "@/lib/seo/site";
import { DEFAULT_FALLBACK_RATES } from "@/lib/constants/currencies";
import { convertMoney } from "@/lib/utils/money";
import { exchangeRateApiServer } from "@/services/exchangeRate/exchangeRateApi.server";
import { reviewsApiServer } from "@/services/reviews/reviewsApi.server";
import type { GameReviewsResponse } from "@/services/reviews/types";

/** Schema currency is fixed to INR regardless of the stored pricing currency. */
const SCHEMA_CURRENCY = "INR";

type JsonLdValue =
    | string
    | number
    | boolean
    | null
    | JsonLdValue[]
    | { [key: string]: JsonLdValue | undefined };

function toAbsoluteUrl(value?: string | null): string | undefined {
    if (!value) return undefined;

    try {
        return new URL(value, getAbsoluteUrl("/")).toString();
    } catch {
        return undefined;
    }
}

function getPrimaryPricing(variant: Variant, preferredRegion?: string): RegionPricing | null {
  console.log("variant.regionPricing", variant.regionPricing);
  
    if (preferredRegion) {
        const regionalPrice = variant.regionPricing.find(
            (pricing) => pricing.region === preferredRegion
        );

        if (regionalPrice) return regionalPrice;
    }

    return variant.regionPricing[0] || null;
}

/**
 * Live admin-configured rates, matching what the storefront actually displays.
 * Falls back to the static defaults if the exchange-rate API is unreachable.
 */
async function getSchemaRates(): Promise<Record<string, number>> {
    try {
        const res = await exchangeRateApiServer.getAll();
        console.log("res", res);
        
        if (!res.success) return DEFAULT_FALLBACK_RATES;

        const ratesMap: Record<string, number> = { USD: 1 };
        for (const r of res.data) {
            ratesMap[r.targetCurrency] = r.rate;
        }
                console.log("ratesMap", ratesMap);

        return ratesMap;
        
    } catch {
        return DEFAULT_FALLBACK_RATES;
    }
}

function getComparablePrices(
    game: Game,
    activeVariants: Variant[],
    rates: Record<string, number>
) {
    const preferredRegion = game.regions?.[0];
    const primaryPricing = activeVariants
        .map((variant) => getPrimaryPricing(variant, preferredRegion))
        .find((pricing): pricing is RegionPricing => Boolean(pricing));

    if (!primaryPricing) return null;

    const prices = activeVariants
        .map((variant) => getPrimaryPricing(variant, preferredRegion))
        .filter((pricing): pricing is RegionPricing => {
            return pricing !== null && pricing.currency === primaryPricing.currency;
        })
        .map((pricing) => pricing.discountedPrice ?? pricing.price)
        .filter((price) => Number.isFinite(price) && price >= 0);

    if (prices.length === 0) return null;

    const toSchemaCurrency = (amount: number) =>
        convertMoney(amount, primaryPricing.currency, SCHEMA_CURRENCY, rates);

    return {
        currency: SCHEMA_CURRENCY,
        lowPrice: toSchemaCurrency(Math.min(...prices)),
        highPrice: toSchemaCurrency(Math.max(...prices)),
        offerCount: prices.length,
    };
}

function buildProductSchema(
    game: Game,
    pageUrl: string,
    rates: Record<string, number>,
    reviewData?: GameReviewsResponse["data"]
): JsonLdValue {
    const activeVariants = (game.variants || []).filter(
        (variant) => variant.status === "active"
    );
    const comparablePrices = getComparablePrices(game, activeVariants, rates);
    const isAvailable = game.status === "active" && activeVariants.length > 0;
    const imageUrl = toAbsoluteUrl(game.imageUrl);
    const summary = reviewData?.summary;
    const hasAggregateRating =
        Boolean(summary) &&
        Number.isFinite(summary?.averageRating) &&
        Number.isFinite(summary?.totalReviews) &&
        (summary?.averageRating ?? 0) >= 1 &&
        (summary?.averageRating ?? 0) <= 5 &&
        (summary?.totalReviews ?? 0) > 0;
    const validReviews = (reviewData?.reviews ?? [])
        .filter((review) => {
            const authorName =
                typeof review.user === "object" ? review.user.name?.trim() : "";
            return (
                Boolean(authorName) &&
                Boolean(review.comment?.trim()) &&
                Number.isFinite(review.rating) &&
                review.rating >= 1 &&
                review.rating <= 5
            );
        })
        .slice(0, 5);

    return {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name: game.name,
        description:
            game.metaDescription ||
            game.description ||
            `Buy ${game.name} top up with fast delivery.`,
        image: imageUrl ? [imageUrl] : undefined,
        category: game.paymentCategory || game.category || "Game Top Up",
        brand: {
            "@type": "Brand",
            name: game.name,
        },
        sku: game.slug,
        url: pageUrl,
        ...(hasAggregateRating
            ? {
                  aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: String(summary!.averageRating),
                      reviewCount: summary!.totalReviews,
                      bestRating: "5",
                      worstRating: "1",
                  },
              }
            : {}),
        ...(validReviews.length > 0
            ? {
                  review: validReviews.map((review) => ({
                      "@type": "Review",
                      author: {
                          "@type": "Person",
                          name:
                              typeof review.user === "object"
                                  ? review.user.name!.trim()
                                  : "",
                      },
                      reviewRating: {
                          "@type": "Rating",
                          ratingValue: String(review.rating),
                          bestRating: "5",
                          worstRating: "1",
                      },
                      reviewBody: review.comment.trim(),
                      datePublished: review.createdAt.slice(0, 10),
                  })),
              }
            : {}),
        offers: comparablePrices
            ? {
                  "@type": "AggregateOffer",
                  url: pageUrl,
                  priceCurrency: comparablePrices.currency,
                  lowPrice: String(comparablePrices.lowPrice),
                  highPrice: String(comparablePrices.highPrice),
                  offerCount: comparablePrices.offerCount,
                  availability: isAvailable
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
              }
            : {
                  "@type": "Offer",
                  url: pageUrl,
                  availability: isAvailable
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
              },
    };
}

function buildFaqSchema(game: Game, pageUrl: string): JsonLdValue | null {
    const faqItems = (game.faqs || []).filter(
        (faq) => faq.question.trim() && faq.answer.trim()
    );

    if (faqItems.length === 0) return null;

    return {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}

export async function getGameJsonLd(game: Game, pathname: string): Promise<JsonLdValue> {
    const pageUrl = getAbsoluteUrl(pathname);
    const [rates, reviewResponse] = await Promise.all([
        getSchemaRates(),
        reviewsApiServer.getGameReviews(game._id).catch(() => null),
    ]);
    const reviewData = reviewResponse?.success ? reviewResponse.data : undefined;
    const graph = [buildProductSchema(game, pageUrl, rates, reviewData)];
    const faqSchema = buildFaqSchema(game, pageUrl);

    if (faqSchema) {
        graph.push(faqSchema);
    }

    return {
        "@context": "https://schema.org",
        "@graph": graph,
    };
}
