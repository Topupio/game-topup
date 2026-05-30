"use client";

import { useEffect, useState } from "react";
import { RiStarFill, RiStarLine } from "react-icons/ri";
import { reviewsApiClient } from "@/services/reviews/reviewsApi.client";
import { GameReviewItem } from "@/services/reviews/types";

type Props = {
    gameId: string;
};

function getReviewerName(review: GameReviewItem) {
    if (typeof review.user === "object" && review.user?.name) {
        return review.user.name;
    }

    return "Verified customer";
}

function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
    return (
        <div className="flex items-center gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((value) => (
                value <= rating ? (
                    <RiStarFill key={value} className={size} />
                ) : (
                    <RiStarLine key={value} className={size} />
                )
            ))}
        </div>
    );
}

export default function GameReviewsSection({ gameId }: Props) {
    const [reviews, setReviews] = useState<GameReviewItem[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        reviewsApiClient.getGameReviews(gameId, controller.signal)
            .then((res) => {
                setReviews(res.data.reviews);
                setAverageRating(res.data.summary.averageRating);
                setTotalReviews(res.data.summary.totalReviews);
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

    const reviewLabel = totalReviews === 1 ? "1 verified review" : `${totalReviews} verified reviews`;

    return (
        <section className="max-w-7xl mx-auto px-4 mt-10">
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                            Customer Reviews
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Reviews from completed purchases on Topupio.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2 w-fit">
                        <Stars rating={Math.round(averageRating)} />
                        <div className="text-sm">
                            <span className="font-bold text-foreground">
                                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-muted-foreground"> / 5</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2].map((item) => (
                            <div key={item} className="rounded-xl border border-border bg-muted/40 p-4 animate-pulse">
                                <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-4" />
                                <div className="h-3 bg-muted-foreground/20 rounded w-full mb-2" />
                                <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                        No customer reviews yet. Reviews appear here after completed paid orders.
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground mb-4">{reviewLabel}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reviews.map((review) => (
                                <article
                                    key={review._id}
                                    className="rounded-xl border border-border bg-background p-4"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground truncate">
                                                {getReviewerName(review)}
                                            </p>
                                            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Stars rating={review.rating} />
                                    </div>
                                    {review.comment ? (
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {review.comment}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            Rated this purchase {review.rating}/5.
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
