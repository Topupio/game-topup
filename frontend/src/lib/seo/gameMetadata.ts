import type { Metadata } from "next";
import { Game } from "@/lib/types/game";
import { getCanonicalMetadata } from "@/lib/seo/canonical";

function clean(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed || undefined;
}

export function getGameMetadata(game: Game, pathname: string): Metadata {
    const title = clean(game.metaTitle) || game.name;
    const description = clean(game.metaDescription) || clean(game.description);
    const imageUrl = clean(game.imageUrl);

    return {
        ...getCanonicalMetadata(pathname),
        title,
        description,
        openGraph: {
            title,
            description,
            url: pathname,
            images: imageUrl ? [{ url: imageUrl, alt: game.name }] : undefined,
        },
        twitter: {
            card: imageUrl ? "summary_large_image" : "summary",
            title,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}
