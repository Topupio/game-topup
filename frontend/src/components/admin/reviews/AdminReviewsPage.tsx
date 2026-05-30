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
} from "react-icons/ri";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import Pagination from "@/components/admin/shared/Pagination";
import SearchBox from "@/components/admin/shared/SearchBox";
import { reviewsApiClient } from "@/services/reviews/reviewsApi.client";
import { AdminReviewsResponse, GameReviewItem, ReviewParams } from "@/services/reviews/types";

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
        <div className="flex items-center gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((value) => (
                value <= rating ? (
                    <RiStarFill key={value} className="w-4 h-4" />
                ) : (
                    <RiStarLine key={value} className="w-4 h-4" />
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
    const [page, setPage] = useState(initialData.data.pagination.page);
    const [limit, setLimit] = useState(initialData.data.pagination.limit);
    const [totalPages, setTotalPages] = useState(initialData.data.pagination.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.data.pagination.total);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        const params: ReviewParams = {
            page,
            limit,
            search: debouncedSearch || undefined,
        };

        try {
            const res = await reviewsApiClient.adminGetReviews(params, signal);
            setReviews(res.data.reviews);
            setTotalPages(res.data.pagination.totalPages);
            setTotalItems(res.data.pagination.total);
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
    }, [page, limit, debouncedSearch]);

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
        setPage(1);
    };

    return (
        <div className="w-full">
            <AdminToolbar
                title="Review Management"
                actions={
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => fetchData()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
                    >
                        <RiRefreshLine className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                }
            />

            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                <SearchBox
                    value={search}
                    onChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    placeholder="Search review comments..."
                    className="w-full md:w-96"
                />

                {search && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-red-500 transition w-fit"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                {reviews.length === 0 ? (
                    <div className="p-10 text-center">
                        <h2 className="text-lg font-semibold text-gray-900">No reviews found</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Completed-order reviews will appear here once customers submit them.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map((review) => {
                            const user = getUser(review);
                            const game = getGame(review);
                            const order = getOrder(review);

                            return (
                                <div
                                    key={review._id}
                                    className="p-4 md:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_180px_120px] gap-4"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                            <Stars rating={review.rating} />
                                            <span className="text-xs text-gray-400" suppressHydrationWarning>
                                                {new Date(review.createdAt).toLocaleString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-800 leading-6">
                                            {review.comment || "No written comment."}
                                        </p>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                                            <span>
                                                Customer: <strong className="text-gray-700">{user?.name || "Unknown"}</strong>
                                                {user?.email ? ` (${user.email})` : ""}
                                            </span>
                                            <span>
                                                Order: <strong className="text-gray-700">{order?.orderId || "N/A"}</strong>
                                            </span>
                                            {order?.productSnapshot?.name && (
                                                <span>
                                                    Item: <strong className="text-gray-700">{order.productSnapshot.name}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                            {game?.imageUrl ? (
                                                <Image
                                                    src={game.imageUrl}
                                                    alt={game.name}
                                                    width={44}
                                                    height={44}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                                    Game
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{game?.name || "Unknown game"}</p>
                                            <p className="text-xs text-gray-500">Game review</p>
                                        </div>
                                    </div>

                                    <div className="flex lg:justify-end items-center">
                                        <button
                                            type="button"
                                            disabled={deletingId === review._id}
                                            onClick={() => handleDelete(review)}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                        >
                                            <RiDeleteBin6Line className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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
    );
}
