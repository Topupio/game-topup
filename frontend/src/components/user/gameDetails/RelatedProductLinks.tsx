import Image from "next/image";
import Link from "next/link";
import { RiArticleLine, RiArrowRightSLine, RiGamepadLine } from "react-icons/ri";
import type { Game } from "@/lib/types/game";
import type { Blog } from "@/services/blog/types";
import GameCard from "@/components/user/components/GameCard";
import { getCategoryPageHref } from "@/lib/utils/categoryPageUrl";

type RelatedProductLinksProps = {
    relatedGames: Game[];
    relatedBlogs: Blog[];
};

function formatBlogDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function RelatedGameCard({ game }: { game: Game }) {
    return <GameCard game={game} />;
}

function RelatedBlogCard({ blog }: { blog: Blog }) {
    return (
        <Link
            href={`/blogs/${blog.slug}`}
            className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-secondary/40 hover:bg-muted/60 active:bg-muted"
        >
            <div className="relative h-36 w-full overflow-hidden bg-muted sm:h-40">
                <Image
                    src={blog.coverImage || "/placeholder.png"}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex min-h-[140px] flex-1 flex-col p-4 pr-14 sm:pr-4">
                <div className="mb-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0">{formatBlogDate(blog.createdAt)}</span>
                    <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                    <span className="truncate">{blog.category}</span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-secondary">
                    {blog.title}
                </p>
                {blog.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {blog.description}
                    </p>
                )}
                <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs font-semibold text-secondary">
                    <span>Read article</span>
                    <RiArrowRightSLine className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>
        </Link>
    );
}

export default function RelatedProductLinks({
    relatedGames,
    relatedBlogs,
}: RelatedProductLinksProps) {
    const relatedCategory =
        relatedGames[0]?.paymentCategory || relatedGames[0]?.category || "";
    const relatedTopUpsHref = relatedCategory
        ? getCategoryPageHref(relatedCategory)
        : "/categories";
    const gameItems = relatedGames.slice(0, 7).map((game) => (
        <RelatedGameCard key={game._id} game={game} />
    ));
    const blogItems = relatedBlogs.slice(0, 3).map((blog) => (
        <RelatedBlogCard key={blog._id} blog={blog} />
    ));

    if (gameItems.length === 0 && blogItems.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 mt-10 space-y-8">
            {gameItems.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary sm:h-10 sm:w-10 sm:rounded-xl">
                                <RiGamepadLine className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                                    Related Top-Ups
                                </h2>
                                <p className="text-xs text-muted-foreground sm:text-sm">
                                    Similar products from this category
                                </p>
                            </div>
                        </div>
                        <Link
                            href={relatedTopUpsHref}
                            className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-secondary sm:flex"
                        >
                            View all <RiArrowRightSLine className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:flex md:overflow-x-hidden md:pb-2 lg:gap-6 md:[&>*]:min-w-[160px] md:[&>*]:max-w-[220px] md:[&>*]:shrink-0">
                        {gameItems}
                    </div>
                </div>
            )}

            {blogItems.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary sm:h-10 sm:w-10 sm:rounded-xl">
                                <RiArticleLine className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                                    Related Blogs
                                </h2>
                                <p className="text-xs text-muted-foreground sm:text-sm">
                                    Guides and updates that match this product category
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/blogs"
                            className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-secondary sm:flex"
                        >
                            View all <RiArrowRightSLine className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {blogItems}
                    </div>
                </div>
            )}
        </section>
    );
}
