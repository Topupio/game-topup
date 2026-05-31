"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { RiCloseLine, RiStarFill, RiStarLine } from "react-icons/ri";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { Order } from "@/services/orders/types";

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

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    onSuccess?: () => void;
    autoSkipPrompt?: boolean;
}

export default function ReviewModal({
    isOpen,
    onClose,
    order,
    onSuccess,
    autoSkipPrompt = false,
}: ReviewModalProps) {
    const [showForm, setShowForm] = useState(autoSkipPrompt);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const gameName = order.game?.name || "your game";
    const productName = order.productSnapshot?.name || "recent purchase";

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        try {
            await ordersApiClient.submitOrderReview(order._id, {
                rating,
                comment,
            });
            toast.success("Thanks for your review.");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-card shadow-2xl border border-gray-200 dark:border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100 dark:border-border">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                            Order {order.orderId}
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-foreground mt-1">
                            {showForm ? "Write your review" : "Want to review your recent purchase?"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-9 rounded-full border border-gray-200 dark:border-border text-gray-500 hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-muted flex items-center justify-center shrink-0 transition"
                        aria-label="Close review prompt"
                    >
                        <RiCloseLine className="size-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="size-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border shrink-0">
                            {order.game?.imageUrl ? (
                                <Image
                                    src={order.game.imageUrl}
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
                            <h3 className="font-semibold text-gray-900 dark:text-foreground truncate">{gameName}</h3>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground truncate">{productName}</p>
                        </div>
                    </div>

                    {!showForm ? (
                        <>
                            <p className="text-sm text-gray-600 dark:text-muted-foreground leading-6">
                                Your order is complete. Share how the delivery went.
                            </p>
                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-border text-gray-700 dark:text-foreground font-semibold hover:bg-gray-50 dark:hover:bg-muted transition cursor-pointer"
                                >
                                    Not now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(true)}
                                    className="px-4 py-2.5 rounded-xl bg-secondary text-white font-semibold hover:opacity-90 transition cursor-pointer"
                                >
                                    Write review
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <fieldset>
                                <legend className="block text-sm font-semibold text-gray-900 dark:text-foreground mb-2">
                                    Rating
                                </legend>
                                <div className="flex items-center gap-1">
                                    {RATING_VALUES.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRating(value)}
                                            onMouseEnter={() => setHoverRating(value)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="size-10 rounded-lg text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center justify-center transition cursor-pointer"
                                            aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                        >
                                            {value <= (hoverRating || rating) ? (
                                                <RiStarFill className="size-7" />
                                            ) : (
                                                <RiStarLine className="size-7" />
                                            )}
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        {hoverRating || rating}/5
                                    </span>
                                </div>
                            </fieldset>

                            <div>
                                <label htmlFor="review-comment" className="block text-sm font-semibold text-gray-900 dark:text-foreground mb-2">
                                    Review
                                </label>
                                <textarea
                                    id="review-comment"
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    maxLength={1000}
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-300 dark:border-border bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none placeholder:text-muted-foreground"
                                    placeholder="Tell us how the delivery went"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right tabular-nums">
                                    {comment.length}/1000
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (autoSkipPrompt) {
                                            onClose();
                                        } else {
                                            setShowForm(false);
                                        }
                                    }}
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-border text-gray-700 dark:text-foreground font-semibold hover:bg-gray-50 dark:hover:bg-muted transition disabled:opacity-60 cursor-pointer"
                                >
                                    {autoSkipPrompt ? "Cancel" : "Back"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl bg-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
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
