"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { formatFixed } from "@/lib/utils/money";
import type { AdminTopup } from "@/services/wallet/walletAdminApi.client";

/**
 * Approve or reject a top-up.
 *
 * Approving moves real money into a customer's wallet, so the amount and the UTR are
 * restated here rather than relying on the admin having read the table row.
 *
 * Rejecting requires a note. The customer believes they paid; telling them "no" with
 * no reason guarantees a support conversation.
 */
export default function TopupDecisionModal({
    topup,
    decision,
    onClose,
    onConfirm,
}: {
    topup: AdminTopup | null;
    decision: "approve" | "reject";
    onClose: () => void;
    onConfirm: (note: string) => Promise<void>;
}) {
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!topup) return null;

    const isReject = decision === "reject";
    const noteRequired = isReject && !note.trim();

    const handleConfirm = async () => {
        if (noteRequired) return;
        setSubmitting(true);
        try {
            await onConfirm(note.trim());
            setNote("");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={Boolean(topup)} onClose={onClose}>
            <div className="p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    {isReject ? "Reject top-up" : "Approve top-up"}
                </h2>

                <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                    <Row label="Customer" value={topup.user?.name || "Unknown"} />
                    <Row label="Email" value={topup.user?.email || "—"} />
                    <Row label="Amount" value={formatFixed(topup.amountPaise / 100, "INR")} strong />
                    <Row label="Method" value={topup.method.toUpperCase()} />
                    {topup.upi?.utrNumber && <Row label="UTR" value={topup.upi.utrNumber} />}
                    <Row label="Reference" value={topup.topupRef} />
                </div>

                {isReject ? (
                    <p className="mt-4 text-sm text-gray-600">
                        The customer will see this reason. No money moves.
                    </p>
                ) : (
                    <p className="mt-4 text-sm text-gray-600">
                        Check the UTR against your bank statement before approving.{" "}
                        <span className="font-medium text-gray-900">
                            {formatFixed(topup.amountPaise / 100, "INR")}
                        </span>{" "}
                        will be credited immediately.
                    </p>
                )}

                <div className="mt-4">
                    <label htmlFor="topup-note" className="text-sm font-medium text-gray-900">
                        {isReject ? "Reason" : "Note"}
                        {isReject && <span className="text-red-500"> *</span>}
                        {!isReject && <span className="text-gray-400"> (optional)</span>}
                    </label>

                    <textarea
                        id="topup-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder={
                            isReject
                                ? "e.g. No matching payment found for this UTR"
                                : "Anything worth recording"
                        }
                        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary"
                    />
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={submitting || noteRequired}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            isReject ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {submitting
                            ? "Working…"
                            : isReject
                                ? "Reject"
                                : `Approve ${formatFixed(topup.amountPaise / 100, "INR")}`}
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
