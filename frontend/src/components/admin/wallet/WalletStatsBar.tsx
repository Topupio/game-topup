"use client";

import { useEffect, useState } from "react";
import { formatFixed } from "@/lib/utils/money";
import {
    walletAdminApiClient,
    type WalletStats,
} from "@/services/wallet/walletAdminApi.client";

export default function WalletStatsBar() {
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [auditWarning, setAuditWarning] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await walletAdminApiClient.getStats();
                if (res.success) setStats(res.data);
            } catch {
                // The tables below still work without the summary.
            }

            try {
                const res = await walletAdminApiClient.getLatestAudit();
                if (!res.success) return;

                const { audit, isStale } = res.data;

                // A silently stopped audit is worse than one reporting problems, so
                // surface staleness as loudly as a mismatch.
                if (isStale) {
                    setAuditWarning("The nightly reconciliation has not run in over 36 hours.");
                } else if (audit?.status === "mismatch") {
                    setAuditWarning(
                        `Reconciliation found ${audit.mismatchCount} discrepancy(ies) between balances and the ledger.`
                    );
                }
            } catch {
                // No audit endpoint response is not itself an alarm.
            }
        })();
    }, []);

    return (
        <div className="mb-5">
            {auditWarning && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="font-semibold">Wallet audit: </span>
                    {auditWarning}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                    label="Outstanding credit"
                    value={stats ? formatFixed(stats.totalLiabilityPaise / 100, "INR") : "—"}
                    hint="Owed to customers"
                />
                <Stat label="Wallets" value={stats ? String(stats.walletCount) : "—"} />
                <Stat
                    label="Awaiting review"
                    value={stats ? String(stats.pendingTopups) : "—"}
                    highlight={Boolean(stats?.pendingTopups)}
                />
                <Stat label="Credited today" value={stats ? String(stats.topupsToday) : "—"} />
            </div>
        </div>
    );
}

function Stat({
    label,
    value,
    hint,
    highlight,
}: {
    label: string;
    value: string;
    hint?: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`rounded-xl border bg-white p-4 ${
                highlight ? "border-amber-300 bg-amber-50" : "border-gray-300"
            }`}
        >
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
        </div>
    );
}
