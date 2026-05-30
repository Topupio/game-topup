"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { RiCloseLine, RiStarFill, RiStarLine } from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { Order } from "@/services/orders/types";

const getDismissKey = (orderId: string) => `review_prompt_dismissed_${orderId}`;
const RATING_VALUES = [1, 2, 3, 4, 5];

function getErrorMessage(error: unknown) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message;
    }

    return "Failed to submit review";
}

export default function HomeReviewPrompt() {
    const { user, loading } = useAuth();
    const [eligibleOrder, setEligibleOrder] = useState<Order | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (loading || !user) return;

        const controller = new AbortController();

        ordersApiClient.getRecentReviewEligibleOrder(controller.signal)
            .then((res) => {
                const order = res.data?.order;
                if (!order) return;
                const dismissed = window.localStorage.getItem(getDismissKey(order._id));
                if (!dismissed) {
                    setEligibleOrder(order);
                }
            })
            .catch(() => {
                // Do not interrupt the homepage if the prompt check fails.
            });

        return () => controller.abort();
    }, [loading, user]);

    const gameName = eligibleOrder?.game?.name || "your game";
    const productName = eligibleOrder?.productSnapshot?.name || "recent purchase";

    const closePrompt = () => {
        if (eligibleOrder) {
            window.localStorage.setItem(getDismissKey(eligibleOrder._id), "1");
        }
        setEligibleOrder(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!eligibleOrder || submitting) return;

        setSubmitting(true);
        try {
            await ordersApiClient.submitOrderReview(eligibleOrder._id, {
                rating,
                comment,
            });
            window.localStorage.setItem(getDismissKey(eligibleOrder._id), "1");
            setEligibleOrder(null);
            toast.success("Thanks for your review.");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }

        setSubmitting(false);
    };

    if (!eligibleOrder) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                            Order {eligibleOrder.orderId}
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">
                            Want to review your recent purchase?
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={closePrompt}
                        className="size-9 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center shrink-0 transition"
                        aria-label="Close review prompt"
                    >
                        <RiCloseLine className="size-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="size-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            {eligibleOrder.game?.imageUrl ? (
                                <Image
                                    src={eligibleOrder.game.imageUrl}
                                    alt={gameName}
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    Game
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{gameName}</h3>
                            <p className="text-sm text-gray-500 truncate">{productName}</p>
                        </div>
                    </div>

                    {!showForm ? (
                        <>
                            <p className="text-sm text-gray-600 leading-6">
                                Your order is complete. Share how the delivery went.
                            </p>
                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <button
                                    type="button"
                                    onClick={closePrompt}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                                >
                                    Not now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(true)}
                                    className="px-4 py-2.5 rounded-xl bg-secondary text-white font-semibold hover:opacity-90 transition"
                                >
                                    Write review
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <fieldset>
                                <legend className="block text-sm font-semibold text-gray-900 mb-2">
                                    Rating
                                </legend>
                                <div className="flex items-center gap-1">
                                    {RATING_VALUES.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRating(value)}
                                            className="size-10 rounded-lg text-amber-400 hover:bg-amber-50 flex items-center justify-center transition"
                                            aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                        >
                                            {value <= rating ? (
                                                <RiStarFill className="size-7" />
                                            ) : (
                                                <RiStarLine className="size-7" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>

                            <div>
                                <label htmlFor="review-comment" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Review
                                </label>
                                <textarea
                                    id="review-comment"
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    maxLength={1000}
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none"
                                    placeholder="Tell us how the delivery went"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">
                                    {comment.length}/1000
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl bg-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                                >
                                    {submitting ? "Submitting..." : "Submit review"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
