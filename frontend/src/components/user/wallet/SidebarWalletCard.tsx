"use client";

import Link from "next/link";
import { RiWallet3Line, RiAddLine } from "react-icons/ri";
import { useWallet } from "@/context/WalletContext";
import WalletAmount from "./WalletAmount";

/**
 * Wallet balance and an Add Money button, shown in the account sidebar.
 *
 * Renders nothing when the wallet feature is switched off, rather than showing an
 * empty balance that looks broken.
 */
export default function SidebarWalletCard() {
    const { balance, settings, loading } = useWallet();

    if (settings && !settings.enabled) return null;

    return (
        <div className="mt-4 sm:mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-gray-500">
                        <RiWallet3Line className="text-base" />
                        <span className="text-xs font-medium">Wallet Balance</span>
                    </div>

                    <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {loading && !balance ? (
                            <span className="inline-block h-6 w-20 animate-pulse rounded bg-gray-200" />
                        ) : (
                            <WalletAmount balancePaise={balance?.balancePaise ?? 0} />
                        )}
                    </p>
                </div>

                <Link
                    href="/account/wallet/add"
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary/90"
                >
                    <RiAddLine className="text-sm" />
                    Add
                </Link>
            </div>

            {balance?.status === "frozen" && (
                <p className="mt-2 text-xs text-red-600">
                    This wallet is on hold. Please contact support.
                </p>
            )}
        </div>
    );
}
