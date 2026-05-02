import type { Game, RegionPricing, Variant } from "@/lib/types/game";
import { getAbsoluteUrl } from "@/lib/seo/site";

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
    if (preferredRegion) {
        const regionalPrice = variant.regionPricing.find(
            (pricing) => pricing.region === preferredRegion
        );

        if (regionalPrice) return regionalPrice;
    }

    return variant.regionPricing[0] || null;
}

function getComparablePrices(game: Game, activeVariants: Variant[]) {
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

    return {
        currency: primaryPricing.currency,
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: prices.length,
    };
}

function buildProductSchema(game: Game, pageUrl: string): JsonLdValue {
    const activeVariants = (game.variants || []).filter(
        (variant) => variant.status === "active"
    );
    const comparablePrices = getComparablePrices(game, activeVariants);
    const isAvailable = game.status === "active" && activeVariants.length > 0;
    const imageUrl = toAbsoluteUrl(game.imageUrl);

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

export function getGameJsonLd(game: Game, pathname: string): JsonLdValue {
    const pageUrl = getAbsoluteUrl(pathname);
    const graph = [buildProductSchema(game, pageUrl)];
    const faqSchema = buildFaqSchema(game, pageUrl);

    if (faqSchema) {
        graph.push(faqSchema);
    }

    return {
        "@context": "https://schema.org",
        "@graph": graph,
    };
}
