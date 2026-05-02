import { gamesApiServer } from "@/services/games/gamesApi.server";
import GameDetailsPage from "@/components/user/gameDetails/GameDetailsPage";
import { GameDetailResponse } from "@/lib/types/game";
import { permanentRedirect } from "next/navigation";
import { getGameUrl } from "@/lib/utils/getGameUrl";
import type { Metadata } from "next";
import { getCanonicalMetadata } from "@/lib/seo/canonical";
import Script from "next/script";
import { getGameJsonLd } from "@/lib/seo/gameJsonLd";

type GameSlugPageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({
    params,
}: GameSlugPageProps): Promise<Metadata> {
    const { slug } = await params;

    return getCanonicalMetadata(`/games/${slug}`);
}

// Backward-compatible redirect: /games/<slug> → /<category>/<slug>
// If game has no paymentCategory, render directly (avoids infinite loop)
export default async function GameSlugRedirect({
    params,
}: GameSlugPageProps) {
    const { slug } = await params;

    const gameDetailResponse = (await gamesApiServer.get(
        slug
    )) as unknown as GameDetailResponse;
    const gameDetails = gameDetailResponse.data;
    const checkoutTemplates = gameDetailResponse.checkoutTemplates || {};

    const targetUrl = getGameUrl(gameDetails);

    // If game has a paymentCategory, redirect to the new URL
    if (gameDetails.paymentCategory) {
        permanentRedirect(targetUrl);
    }
    const gameJsonLd = getGameJsonLd(gameDetails, targetUrl);
    
    // No paymentCategory — render directly to avoid redirect loop
    return (
        <>
            <Script
                id={`game-jsonld-${gameDetails.slug}`}
                type="application/ld+json"
                strategy="beforeInteractive"
            >
                {JSON.stringify(gameJsonLd)}
            </Script>
            <GameDetailsPage
                gameDetails={gameDetails}
                checkoutTemplates={checkoutTemplates}
            />
        </>
    );
}
