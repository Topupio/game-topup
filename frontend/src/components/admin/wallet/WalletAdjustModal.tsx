"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { walletAdminApiClient } from "@/services/wallet/walletAdminApi.client";
import { formatPaiseAsInr } from "@/lib/utils/money";

type Direction = "debit" | "credit";

const DEBIT_REASONS = [
    "Reversing a refund credited in error",
    "Reversing a top-up credited in error",
    "Correcting a duplicate credit",
];

const CREDIT_REASONS = [
    "Goodwill credit",
    "Compensation for a failed order",
    "Correcting a debit made in error",
];

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
 * Move money into or out of a customer's wallet by hand.
 *
 * A reason is mandatory: the ledger row it lands on is the only lasting record of why the
 * money moved, since the admin activity log expires after 30 days.
 *
 * Debits are capped at the current balance here, but the server is the real guard — it
 * checks the balance inside the same atomic update that decrements it, so a debit raced
 * against a purchase still fails cleanly rather than overdrawing.
 */
export default function WalletAdjustModal({
    open,
    onClose,
    userId,
    userName,
    balancePaise,
    walletStatus = "active",
    onAdjusted,
}: {
    open: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    /** Null while the caller is still loading it. */
    balancePaise: number | null;
    walletStatus?: "active" | "frozen";
    onAdjusted: (newBalancePaise: number) => void;
}) {
    const [direction, setDirection] = useState<Direction>("debit");
    const [amountInr, setAmountInr] = useState("");
    const [reasonChoice, setReasonChoice] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Start from a clean form every time the dialog opens, so a previous attempt's amount
    // or reason can't be submitted against a different decision.
    useEffect(() => {
        if (open) return;
        setDirection("debit");
        setAmountInr("");
        setReasonChoice("");
        setCustomReason("");
    }, [open]);

    const loading = balancePaise === null;
    const frozen = walletStatus === "frozen";

    const presets = direction === "debit" ? DEBIT_REASONS : CREDIT_REASONS;
    const reason = reasonChoice === OTHER_REASON ? customReason.trim() : reasonChoice;

    // The input is in rupees because that is what an admin reads off a receipt, but
    // everything sent to the server is whole paise.
    const amountPaise = Math.round(Number(amountInr) * 100);
    const amountEntered = amountInr.trim() !== "";
    const amountPositive = Number.isFinite(amountPaise) && amountPaise > 0;
    const overBalance =
        direction === "debit" && balancePaise !== null && amountPaise > balancePaise;
    const amountValid = amountPositive && !overBalance;

    const resultingPaise =
        balancePaise === null || !amountPositive
            ? balancePaise
            : direction === "debit"
              ? balancePaise - amountPaise
              : balancePaise + amountPaise;

    const canSubmit = !loading && !frozen && amountValid && Boolean(reason) && !submitting;

    const handleConfirm = async () => {
        if (!canSubmit) return;

        setSubmitting(true);
        try {
            const res =
                direction === "debit"
                    ? await walletAdminApiClient.debitWallet(userId, amountPaise, reason)
                    : await walletAdminApiClient.creditWallet(userId, amountPaise, reason);

            if (res.success) {
                toast.success(
                    `${direction === "debit" ? "Debited" : "Credited"} ${formatPaiseAsInr(amountPaise)}`
                );
                onAdjusted(res.data.balancePaise);
                onClose();
            }
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    direction === "debit" ? "Could not debit the wallet" : "Could not credit the wallet"
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={submitting ? undefined : onClose}>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Adjust wallet</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Moves store credit by hand and records why. This does not touch the
                    customer&apos;s card, UPI or crypto.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    {(["debit", "credit"] as Direction[]).map((dir) => (
                        <button
                            key={dir}
                            type="button"
                            onClick={() => {
                                setDirection(dir);
                                setReasonChoice("");
                                setCustomReason("");
                            }}
                            disabled={submitting}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                                direction === dir
                                    ? dir === "debit"
                                        ? "border-red-300 bg-red-50 text-red-700"
                                        : "border-green-300 bg-green-50 text-green-700"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {dir === "debit" ? "Take money out" : "Put money in"}
                        </button>
                    ))}
                </div>

                {loading && <p className="mt-5 text-sm text-gray-500">Loading wallet…</p>}

                {!loading && frozen && (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                        This wallet is frozen. Unfreeze it before moving money.
                    </div>
                )}

                {!loading && (
                    <>
                        <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                            <Row label="Customer" value={userName} />
                            <Row label="Current balance" value={formatPaiseAsInr(balancePaise)} />
                            {amountPositive && !overBalance && resultingPaise !== null && (
                                <Row
                                    label="Balance after"
                                    value={formatPaiseAsInr(resultingPaise)}
                                    strong
                                />
                            )}
                        </div>

                        <div className="mt-4">
                            <label htmlFor="adjustAmount" className="text-sm font-medium text-gray-900">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="adjustAmount"
                                type="number"
                                value={amountInr}
                                onChange={(e) => setAmountInr(e.target.value)}
                                min={0.01}
                                step={0.01}
                                disabled={submitting || frozen}
                                placeholder={
                                    direction === "debit"
                                        ? `Up to ${(balancePaise / 100).toFixed(2)}`
                                        : "0.00"
                                }
                                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
                            />
                            {amountEntered && !amountPositive && (
                                <p className="mt-1 text-xs text-red-600">
                                    Enter an amount greater than ₹0.
                                </p>
                            )}
                            {overBalance && (
                                <p className="mt-1 text-xs text-red-600">
                                    Only {formatPaiseAsInr(balancePaise)} is available to take out.
                                </p>
                            )}
                        </div>

                        <div className="mt-4">
                            <label htmlFor="adjustReason" className="text-sm font-medium text-gray-900">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="adjustReason"
                                value={reasonChoice}
                                onChange={(e) => setReasonChoice(e.target.value)}
                                disabled={submitting || frozen}
                                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
                            >
                                <option value="">Pick a reason…</option>
                                {presets.map((preset) => (
                                    <option key={preset} value={preset}>
                                        {preset}
                                    </option>
                                ))}
                                <option value={OTHER_REASON}>Other (write it below)</option>
                            </select>

                            {reasonChoice === OTHER_REASON && (
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    rows={2}
                                    maxLength={500}
                                    autoFocus
                                    disabled={submitting}
                                    placeholder="Why is this money moving?"
                                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
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
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            direction === "debit"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {submitting
                            ? "Saving…"
                            : amountValid
                              ? `${direction === "debit" ? "Take out" : "Put in"} ${formatPaiseAsInr(amountPaise)}`
                              : direction === "debit"
                                ? "Take money out"
                                : "Put money in"}
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
