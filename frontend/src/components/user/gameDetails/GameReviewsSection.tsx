"use client";

import { useEffect, useState } from "react";
import { RiStarFill, RiStarLine, RiStarHalfFill } from "react-icons/ri";
import { RiUserLine } from "react-icons/ri";
import { reviewsApiClient } from "@/services/reviews/reviewsApi.client";
import { GameReviewItem, RatingDistribution } from "@/services/reviews/types";

const VISIBLE_REVIEW_COUNT = 5;

type Props = {
    gameId: string;
};

function getReviewerName(review: GameReviewItem) {
    if (typeof review.user === "object" && review.user?.name) {
        return review.user.name;
    }

    return "Verified customer";
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((value) => {
                if (value <= Math.floor(rating)) {
                    return (
                        <RiStarFill
                            key={value}
                            style={{ width: size, height: size }}
                            className="text-amber-400"
                        />
                    );
                }
                if (value === Math.ceil(rating) && rating % 1 >= 0.3) {
                    return (
                        <RiStarHalfFill
                            key={value}
                            style={{ width: size, height: size }}
                            className="text-amber-400"
                        />
                    );
                }
                return (
                    <RiStarLine
                        key={value}
                        style={{ width: size, height: size }}
                        className="text-amber-400/40"
                    />
                );
            })}
        </div>
    );
}

function RatingBar({
    star,
    count,
    total,
}: {
    star: number;
    count: number;
    total: number;
}) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-12 text-right text-muted-foreground whitespace-nowrap">
                {star} star{star !== 1 ? "s" : ""}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${pct}%`,
                        background:
                            "linear-gradient(90deg, #FBBF24, #F59E0B)",
                    }}
                />
            </div>
            <span className="w-10 text-right text-muted-foreground text-xs tabular-nums">
                {pct}%
            </span>
        </div>
    );
}

function ReviewCard({ review }: { review: GameReviewItem }) {
    const name = getReviewerName(review);

    return (
        <article className="flex gap-3.5 py-5 border-b border-border last:border-b-0 transition-colors hover:bg-muted/20 -mx-2 px-2 rounded-lg">
            {/* Avatar */}
            <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    color: "white",
                }}
            >
                {name === "Verified customer" ? (
                    <RiUserLine className="w-5 h-5" />
                ) : (
                    getInitials(name)
                )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mb-1">
                    <span className="font-semibold text-foreground text-sm truncate">
                        {name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                    </span>
                </div>

                <Stars rating={review.rating} size={14} />

                {review.comment ? (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        {review.comment}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground/60 italic mt-2">
                        Rated this purchase {review.rating}/5.
                    </p>
                )}
            </div>
        </article>
    );
}

function SkeletonLoader() {
    return (
        <div className="animate-pulse">
            {/* Summary skeleton */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-16 bg-muted-foreground/10 rounded" />
                    <div className="h-4 w-24 bg-muted-foreground/10 rounded" />
                    <div className="h-3 w-20 bg-muted-foreground/10 rounded" />
                </div>
                <div className="flex-1 space-y-3">
                    {[5, 4, 3, 2, 1].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className="w-12 h-3 bg-muted-foreground/10 rounded" />
                            <div className="flex-1 h-2.5 bg-muted-foreground/10 rounded-full" />
                            <div className="w-10 h-3 bg-muted-foreground/10 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Review skeletons */}
            {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 py-5 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-muted-foreground/10" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted-foreground/10 rounded w-1/3" />
                        <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                        <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function GameReviewsSection({ gameId }: Props) {
    const [reviews, setReviews] = useState<GameReviewItem[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingDistribution, setRatingDistribution] =
        useState<RatingDistribution>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        reviewsApiClient
            .getGameReviews(gameId, controller.signal)
            .then((res) => {
                setReviews(res.data.reviews);
                setAverageRating(res.data.summary.averageRating);
                setTotalReviews(res.data.summary.totalReviews);
                if (res.data.summary.ratingDistribution) {
                    setRatingDistribution(res.data.summary.ratingDistribution);
                }
            })
            .catch(() => {
                setReviews([]);
                setAverageRating(0);
                setTotalReviews(0);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [gameId]);

    const visibleReviews = showAll
        ? reviews
        : reviews.slice(0, VISIBLE_REVIEW_COUNT);
    const hasMore = reviews.length > VISIBLE_REVIEW_COUNT && !showAll;

    return (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-8">
                {/* Section Title */}
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-6">
                    User Reviews
                </h2>

                {loading ? (
                    <SkeletonLoader />
                ) : reviews.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                        No customer reviews yet. Reviews appear here after
                        completed paid orders.
                    </div>
                ) : (
                    <>
                        {/* ── Summary Block (Rating + Star Bars) ── */}
                        <div className="rounded-xl bg-muted/30 p-5 sm:p-6 mb-6">
                            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 max-w-2xl">
                                {/* Big Rating */}
                                <div className="flex flex-col items-center gap-1.5 shrink-0">
                                    <span className="text-5xl font-extrabold text-foreground leading-none tracking-tight">
                                        {averageRating > 0
                                            ? averageRating.toFixed(1)
                                            : "0.0"}
                                    </span>
                                    <Stars
                                        rating={averageRating}
                                        size={22}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {totalReviews.toLocaleString()}{" "}
                                        {totalReviews === 1 ? "review" : "reviews"}
                                    </p>
                                </div>

                                {/* Star Bars */}
                                <div className="flex-1 flex flex-col justify-center gap-2 min-w-0 max-w-md">
                                    {([5, 4, 3, 2, 1] as const).map((star) => (
                                        <RatingBar
                                            key={star}
                                            star={star}
                                            count={ratingDistribution[star]}
                                            total={totalReviews}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Individual Reviews ── */}
                        <div>
                            {visibleReviews.map((review) => (
                                <ReviewCard
                                    key={review._id}
                                    review={review}
                                />
                            ))}
                        </div>

                        {/* ── Show More ── */}
                        {hasMore && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                >
                                    Show all reviews
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
    );
}
