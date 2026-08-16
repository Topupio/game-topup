"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RiAddLine, RiWallet3Line } from "react-icons/ri";
import { useWallet } from "@/context/WalletContext";
import { walletApiClient } from "@/services/wallet/walletApi.client";
import type { WalletTransaction } from "@/services/wallet/types";
import { formatFixed } from "@/lib/utils/money";
import WalletAmount from "./WalletAmount";
import TransactionList from "./TransactionList";
import AccountPagination from "@/components/user/account/AccountPagination";

const PAGE_SIZE = 10;

export default function WalletPageClient() {
    const { balance, settings, loading: balanceLoading } = useWallet();

    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await walletApiClient.getTransactions({ page, limit: PAGE_SIZE });
            if (res.success) {
                setTransactions(res.data.transactions);
                setTotalPages(res.data.pagination.totalPages || 1);
            }
        } catch {
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    const walletOff = settings && !settings.enabled;

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Balance */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <RiWallet3Line />
                            <span className="text-sm font-medium">Wallet Balance</span>
                        </div>

                        <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                            {balanceLoading && !balance ? (
                                <span className="inline-block h-9 w-32 animate-pulse rounded bg-gray-200" />
                            ) : (
                                <WalletAmount balancePaise={balance?.balancePaise ?? 0} />
                            )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Store credit. It can be spent on any order but cannot be withdrawn.
                        </p>
                    </div>

                    {!walletOff && (
                        <Link
                            href="/account/wallet/add"
                            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
                        >
                            <RiAddLine />
                            Add Money
                        </Link>
                    )}
                </div>

                {balance?.status === "frozen" && (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                        This wallet is on hold. Please contact support.
                    </p>
                )}

                {walletOff && (
                    <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                        Wallet top-ups are temporarily unavailable.
                    </p>
                )}
            </div>

            {/* History */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                    Transaction History
                </h2>

                <div className="mt-3">
                    <TransactionList transactions={transactions} loading={loading} />
                </div>

                {totalPages > 1 && (
                    <div className="mt-4">
                        <AccountPagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
