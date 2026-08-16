"use client";

import Link from "next/link";
import {
    RiArrowDownLine,
    RiArrowUpLine,
    RiWallet3Line,
} from "react-icons/ri";
import { formatFixed } from "@/lib/utils/money";
import type { WalletTransaction } from "@/services/wallet/types";

/** Plain-language label for each ledger entry type. */
const TYPE_LABELS: Record<WalletTransaction["type"], string> = {
    credit_topup: "Money added",
    credit_refund: "Refund",
    credit_manual: "Credit from support",
    credit_promo: "Promotional credit",
    credit_referral: "Referral reward",
    debit_order: "Order payment",
    debit_manual: "Adjustment by support",
};

function formatDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function TransactionList({
    transactions,
    loading,
}: {
    transactions: WalletTransaction[];
    loading?: boolean;
}) {
    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
                <RiWallet3Line className="mx-auto text-3xl text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-900">No transactions yet</p>
                <p className="mt-1 text-xs text-gray-500">
                    Add money to your wallet to get started.
                </p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-gray-100">
            {transactions.map((txn) => {
                const isCredit = txn.deltaPaise > 0;

                return (
                    <li key={txn._id} className="flex items-start gap-3 py-3 sm:py-4">
                        <span
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                isCredit ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {isCredit ? <RiArrowDownLine /> : <RiArrowUpLine />}
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {TYPE_LABELS[txn.type] ?? txn.type}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">{formatDate(txn.createdAt)}</p>

                            {txn.order?.orderId && (
                                <Link
                                    href={`/orders/${txn.order._id}`}
                                    className="mt-1 inline-block text-xs font-medium text-secondary hover:underline"
                                >
                                    Order {txn.order.orderId}
                                </Link>
                            )}

                            {/* Shown so a support credit or debit is never unexplained. */}
                            {txn.reason && (
                                <p className="mt-1 text-xs text-gray-600">{txn.reason}</p>
                            )}

                            {txn.meta?.partial === true && (
                                <p className="mt-1 text-xs text-amber-600">
                                    Partial payment — credited the amount received
                                </p>
                            )}
                        </div>

                        <div className="shrink-0 text-right">
                            <p
                                className={`text-sm font-semibold ${
                                    isCredit ? "text-green-600" : "text-gray-900"
                                }`}
                            >
                                {isCredit ? "+" : "−"}
                                {formatFixed(txn.amountPaise / 100, "INR")}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                                {formatFixed(txn.balanceAfterPaise / 100, "INR")}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
