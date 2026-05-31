"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import {
    RiDeleteBin6Line,
    RiRefreshLine,
    RiStarFill,
    RiStarLine,
    RiFilter3Line,
    RiSortAsc,
    RiUserLine,
    RiShoppingBag3Line,
    RiCalendarEventLine,
    RiGameLine,
} from "react-icons/ri";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import Pagination from "@/components/admin/shared/Pagination";
import SearchBox from "@/components/admin/shared/SearchBox";
import { reviewsApiClient } from "@/services/reviews/reviewsApi.client";
import { gamesApiClient } from "@/services/games";
import { AdminReviewsResponse, GameReviewItem, ReviewParams } from "@/services/reviews/types";
import { Game } from "@/lib/types/game";

type Props = {
    initialData: AdminReviewsResponse;
};

function getUser(review: GameReviewItem) {
    return typeof review.user === "object" ? review.user : null;
}

function getGame(review: GameReviewItem) {
    return typeof review.game === "object" ? review.game : null;
}

function getOrder(review: GameReviewItem) {
    return typeof review.order === "object" ? review.order : null;
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
            {[1, 2, 3, 4, 5].map((value) => (
                value <= rating ? (
                    <RiStarFill key={value} className="w-4 h-4" />
                ) : (
                    <RiStarLine key={value} className="w-4 h-4/40" />
                )
            ))}
        </div>
    );
}

export default function AdminReviewsPage({ initialData }: Props) {
    const [reviews, setReviews] = useState<GameReviewItem[]>(initialData.data.reviews);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);
    const [games, setGames] = useState<{ _id: string; name: string }[]>(initialData.data.reviewedGames || []);
    const [selectedGame, setSelectedGame] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    
    const [page, setPage] = useState(initialData.data.pagination.page);
    const [limit, setLimit] = useState(initialData.data.pagination.limit);
    const [totalPages, setTotalPages] = useState(initialData.data.pagination.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.data.pagination.total);

    // Fetch the list of games for the dropdown if initialData doesn't have it
    useEffect(() => {
        if (!games || games.length === 0) {
            gamesApiClient.list({ limit: 100 })
                .then((res) => {
                    if (res.data) {
                        setGames(res.data);
                    }
                })
                .catch(() => {
                    // Silently handle games fetch failure
                });
        }
    }, []);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        const params: ReviewParams = {
            page,
            limit,
            search: debouncedSearch || undefined,
            game: selectedGame || undefined,
            rating: selectedRating || undefined,
            sort: sortBy || undefined,
        };

        try {
            const res = await reviewsApiClient.adminGetReviews(params, signal);
            setReviews(res.data.reviews);
            setTotalPages(res.data.pagination.totalPages);
            setTotalItems(res.data.pagination.total);
            if (res.data.reviewedGames) {
                setGames(res.data.reviewedGames);
            }
        } catch (error: unknown) {
            const requestError = error as { name?: string; code?: string };
            if (requestError.name !== "CanceledError" && requestError.code !== "ERR_CANCELED") {
                toast.error("Failed to fetch reviews");
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [page, limit, debouncedSearch, selectedGame, selectedRating, sortBy]);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const controller = new AbortController();
        void fetchData(controller.signal);

        return () => controller.abort();
    }, [fetchData]);

    const handleDelete = async (review: GameReviewItem) => {
        if (!confirm("Delete this customer review? This cannot be undone.")) {
            return;
        }

        setDeletingId(review._id);
        const previousReviews = reviews;
        const previousTotalItems = totalItems;
        setReviews((current) => current.filter((item) => item._id !== review._id));
        setTotalItems((current) => Math.max(0, current - 1));

        try {
            await reviewsApiClient.adminDeleteReview(review._id);
            toast.success("Review deleted");
        } catch (error: unknown) {
            setReviews(previousReviews);
            setTotalItems(previousTotalItems);
            const requestError = error as { response?: { data?: { message?: string } } };
            toast.error(requestError.response?.data?.message || "Failed to delete review");
        } finally {
            setDeletingId(null);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedGame("");
        setSelectedRating("");
        setSortBy("newest");
        setPage(1);
    };

    const hasActiveFilters = search || selectedGame || selectedRating || sortBy !== "newest";

    return (
        <div className="w-full space-y-6">
            <AdminToolbar
                title="Review Management"
                actions={
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => fetchData()}
                        className="flex items-center gap-2 px-4.5 py-2.5 bg-white border border-gray-250 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-50 shadow-sm font-semibold text-sm cursor-pointer"
                    >
                        <RiRefreshLine className={loading ? "animate-spin text-indigo-600" : "text-gray-500"} />
                        Refresh List
                    </button>
                }
            />

            {/* Filter Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search Comment</label>
                        <SearchBox
                            value={search}
                            onChange={(value) => {
                                      setSearch(value);
                                      setPage(1);
                            }}
                            placeholder="Type comment keywords..."
                            className="w-full h-11"
                        />
                    </div>

                    {/* Game Select */}
                    <div className="space-y-2">
                        <label htmlFor="game-filter" className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <RiFilter3Line className="w-3.5 h-3.5 text-gray-400" /> Filter by Game
                        </label>
                        <select
                            id="game-filter"
                            value={selectedGame}
                            onChange={(e) => {
                                setSelectedGame(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition cursor-pointer font-medium hover:border-gray-450"
                        >
                            <option value="">All Games</option>
                            {games.map((g) => (
                                <option key={g._id} value={g._id}>
                                    {g.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Rating Select */}
                    <div className="space-y-2">
                        <label htmlFor="rating-filter" className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <RiStarFill className="w-3.5 h-3.5 text-amber-400" /> Filter by Rating
                        </label>
                        <select
                            id="rating-filter"
                            value={selectedRating}
                            onChange={(e) => {
                                setSelectedRating(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition cursor-pointer font-medium hover:border-gray-450"
                        >
                            <option value="">All Ratings</option>
                            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                            <option value="3">⭐⭐⭐ (3 Stars)</option>
                            <option value="2">⭐⭐ (2 Stars)</option>
                            <option value="1">⭐ (1 Star)</option>
                        </select>
                    </div>

                    {/* Sort Select */}
                    <div className="space-y-2">
                        <label htmlFor="sort-filter" className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <RiSortAsc className="w-3.5 h-3.5 text-gray-400" /> Sort By
                        </label>
                        <select
                            id="sort-filter"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition cursor-pointer font-medium hover:border-gray-450"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest_rating">Highest Rating</option>
                            <option value="lowest_rating">Lowest Rating</option>
                        </select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg">
                            Active filters applied
                        </span>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer hover:underline"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Content Table / Cards */}
            <div className={`space-y-4 transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                {reviews.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <RiFilter3Line className="w-7 h-7" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">No reviews found</h2>
                        <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
                            We couldn't find any reviews matching your search criteria. Try adjusting your filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {reviews.map((review) => {
                            const user = getUser(review);
                            const game = getGame(review);
                            const order = getOrder(review);

                            return (
                                <article
                                    key={review._id}
                                    className="bg-white border border-gray-205 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col gap-4"
                                >
                                    {/* Row 1: Game Cover, Title, Package Info, & Actions */}
                                    <div className="flex items-center justify-between gap-4 w-full">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Game Thumbnail */}
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0 shadow-xs">
                                                {game?.imageUrl ? (
                                                    <Image
                                                        src={game.imageUrl}
                                                        alt={game.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-semibold">
                                                        Game
                                                    </div>
                                                )}
                                            </div>

                                            {/* Game and Package Titles grouped tightly together */}
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                    <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                                        {game?.name || "Unknown Game"}
                                                    </h3>
                                                    {order?.productSnapshot?.name && (
                                                        <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                                                            {order.productSnapshot.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium">Customer Review</p>
                                            </div>
                                        </div>

                                        {/* Action Button (Delete) */}
                                        <button
                                            type="button"
                                            disabled={deletingId === review._id}
                                            onClick={() => handleDelete(review)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition disabled:opacity-50 text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
                                        >
                                            <RiDeleteBin6Line className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gray-100 w-full" />

                                    {/* Row 2: Review Content and Metadata */}
                                    <div className="space-y-3 min-w-0">
                                        {/* Rating, Date, and Order info row */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Stars rating={review.rating} />

                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100" suppressHydrationWarning>
                                                <RiCalendarEventLine className="w-3 h-3 text-gray-400" />
                                                {new Date(review.createdAt).toLocaleString()}
                                            </span>

                                            {order?.orderId && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                                    Order: #{order.orderId}
                                                </span>
                                            )}
                                        </div>

                                        {/* Comment comment */}
                                        <div className="relative">
                                            {review.comment ? (
                                                <blockquote className="text-[14px] text-gray-800 leading-relaxed font-medium pl-1 border-l-2 border-indigo-200">
                                                    "{review.comment}"
                                                </blockquote>
                                            ) : (
                                                <span className="text-[14px] text-gray-400 italic">
                                                    No written comment submitted.
                                                </span>
                                            )}
                                        </div>

                                        {/* Customer Meta Badge info */}
                                        <div className="flex flex-wrap gap-2.5 pt-1">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-xl">
                                                <RiUserLine className="w-3.5 h-3.5 text-gray-500" />
                                                Submitted by: <strong className="text-gray-800 font-semibold">{user?.name || "Unknown"}</strong>
                                                {user?.email && (
                                                    <span className="text-gray-400 text-[11px] ml-1">({user.email})</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="pt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        limit={limit}
                        onPageChange={setPage}
                        onLimitChange={(nextLimit) => {
                            setLimit(nextLimit);
                            setPage(1);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
