"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import StatusSelect from "@/components/admin/shared/StatusSelect";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import type { Order, RefundQuote } from "@/services/orders/types";
import { formatPaiseAsInr } from "@/lib/utils/money";

const OTHER_REASON = "__other__";

function getErrorMessage(error: unknown, fallback: string) {
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

    return fallback;
}

/**
 * Confirm a refund of an order into the customer's wallet.
 *
 * This is store credit, not a payment reversal — the customer's card, UPI or crypto is
 * untouched. The amount comes from the server quote and is never computed here, because
 * how it is derived depends on how the order was paid.
 *
 * A reason is mandatory: the ledger row it lands on is the only lasting record of why
 * the money moved.
 */
export default function RefundToWalletModal({
    order,
    open,
    onClose,
    onRefunded,
}: {
    order: Order;
    open: boolean;
    onClose: () => void;
    onRefunded: (order: Order) => void;
}) {
    const [quote, setQuote] = useState<RefundQuote | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [reasonChoice, setReasonChoice] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [partial, setPartial] = useState(false);
    const [amountInr, setAmountInr] = useState("");

    const loadQuote = useCallback(
        async (signal: AbortSignal) => {
            setLoading(true);
            try {
                const res = await ordersApiClient.adminGetRefundQuote(order._id, signal);
                if (res.success) setQuote(res.data);
            } catch (error) {
                if (signal.aborted) return;
                toast.error(getErrorMessage(error, "Could not load the refund amount"));
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        },
        [order._id]
    );

    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();
        loadQuote(controller.signal);
        return () => controller.abort();
    }, [open, loadQuote]);

    // Start from a clean form every time the dialog opens, so a previous attempt's
    // reason can't be submitted against a different decision.
    useEffect(() => {
        if (open) return;
        setQuote(null);
        setReasonChoice("");
        setCustomReason("");
        setPartial(false);
        setAmountInr("");
    }, [open]);

    const remainingPaise = quote?.remainingPaise ?? 0;
    const reasonOptions = [
        ...(quote?.reasons ?? []).map((r) => ({ label: r, value: r })),
        { label: "Other (write it below)", value: OTHER_REASON },
    ];

    const reason = reasonChoice === OTHER_REASON ? customReason.trim() : reasonChoice;

    // The amount input is in rupees because that is what an admin reads off the order,
    // but everything sent to the server is paise.
    const partialPaise = Math.round(Number(amountInr) * 100);
    const partialValid =
        Number.isFinite(partialPaise) && partialPaise > 0 && partialPaise <= remainingPaise;

    const amountToRefundPaise = partial && partialValid ? partialPaise : remainingPaise;
    const canSubmit =
        Boolean(quote?.refundable) && Boolean(reason) && (!partial || partialValid) && !submitting;

    const handleConfirm = async () => {
        if (!canSubmit) return;

        setSubmitting(true);
        try {
            const res = await ordersApiClient.adminRefundToWallet(order._id, {
                reason,
                ...(partial ? { amountPaise: partialPaise } : {}),
            });

            if (res.success) {
                toast.success(res.message || "Refunded to wallet");
                onRefunded(res.data.order);
                onClose();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Refund failed"));
        } finally {
            setSubmitting(false);
        }
    };

    const customerName = order.user?.name;

    return (
        <Modal open={open} onClose={submitting ? undefined : onClose}>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Refund to wallet</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Credits the customer&apos;s wallet. The original payment is not reversed.
                </p>

                {loading && <p className="mt-5 text-sm text-gray-500">Loading refund amount…</p>}

                {!loading && quote && !quote.refundable && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        {quote.message || "This order cannot be refunded."}
                    </div>
                )}

                {!loading && quote?.refundable && (
                    <>
                        <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                            <Row label="Order" value={order.orderId} />
                            {customerName && <Row label="Customer" value={customerName} />}
                            <Row label="Paid via" value={(quote.paymentMethod || "—").toUpperCase()} />
                            {Boolean(quote.alreadyRefundedPaise) && (
                                <Row
                                    label="Already refunded"
                                    value={formatPaiseAsInr(quote.alreadyRefundedPaise!)}
                                />
                            )}
                            <Row
                                label="Refunding"
                                value={formatPaiseAsInr(amountToRefundPaise)}
                                strong
                            />
                        </div>

                        {quote.convertedAtTodaysRate && (
                            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                                This order was charged in another currency and no historical rate
                                was recorded, so the figure above uses today&apos;s rate. It is not
                                an exact reversal of what the customer paid.
                            </p>
                        )}

                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-900">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <StatusSelect
                                    options={reasonOptions}
                                    value={reasonChoice}
                                    onChange={setReasonChoice}
                                    disabled={submitting}
                                />
                            </div>

                            {reasonChoice === OTHER_REASON && (
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    rows={2}
                                    maxLength={500}
                                    autoFocus
                                    placeholder="Why is this being refunded?"
                                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={partial}
                                    onChange={(e) => setPartial(e.target.checked)}
                                    disabled={submitting}
                                />
                                Refund a partial amount
                            </label>

                            {partial && (
                                <>
                                    <input
                                        type="number"
                                        value={amountInr}
                                        onChange={(e) => setAmountInr(e.target.value)}
                                        min={0.01}
                                        max={remainingPaise / 100}
                                        step={0.01}
                                        placeholder={`Up to ${remainingPaise / 100}`}
                                        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                    {amountInr && !partialValid && (
                                        <p className="mt-1 text-xs text-red-600">
                                            Enter an amount between ₹0.01 and{" "}
                                            {formatPaiseAsInr(remainingPaise)}.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!canSubmit}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting
                            ? "Refunding…"
                            : `Refund ${formatPaiseAsInr(amountToRefundPaise)}`}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="text-gray-500">{label}</span>
            <span className={`text-right ${strong ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                {value}
            </span>
        </div>
    );
}
