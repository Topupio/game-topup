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
 *
 * Mobile gets a dark gradient card (inspired by the reference drawer mockup);
 * desktop keeps the existing light card unchanged.
 */
export default function SidebarWalletCard() {
    const { balance, settings, loading } = useWallet();

    if (settings && !settings.enabled) return null;

    const isFrozen = balance?.status === "frozen";

    return (
        <>
            {/* Mobile - dark gradient card */}
            <div className="mt-4 lg:hidden rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-4 text-white">
                <div className="flex items-center gap-2 text-slate-300">
                    <RiWallet3Line className="text-base" />
                    <span className="text-xs font-medium">Wallet Balance</span>
                </div>

                <p className="mt-1.5 text-2xl font-bold truncate">
                    {loading && !balance ? (
                        <span className="inline-block h-7 w-24 animate-pulse rounded bg-white/10" />
                    ) : (
                        <WalletAmount balancePaise={balance?.balancePaise ?? 0} />
                    )}
                </p>

                {isFrozen && (
                    <p className="mt-2 text-xs text-red-300">
                        This wallet is on hold. Please contact support.
                    </p>
                )}

                <Link
                    href="/account/wallet/add"
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-emerald-950 transition-opacity hover:opacity-90"
                >
                    <RiAddLine className="text-base" />
                    Add Money
                </Link>
            </div>

            {/* Desktop - existing light card */}
            <div className="hidden lg:block mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-gray-500">
                            <RiWallet3Line className="text-base" />
                            <span className="text-xs font-medium">Wallet Balance</span>
                        </div>

                        <p className="mt-1 text-xl font-bold text-gray-900 truncate">
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

                {isFrozen && (
                    <p className="mt-2 text-xs text-red-600">
                        This wallet is on hold. Please contact support.
                    </p>
                )}
            </div>
        </>
    );
}
