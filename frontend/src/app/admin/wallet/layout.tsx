import React from "react";
import WalletTabs from "@/components/admin/wallet/WalletTabs";
import WalletStatsBar from "@/components/admin/wallet/WalletStatsBar";

export default function AdminWalletLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <h1 className="mb-1 text-xl font-bold text-gray-900">Wallet</h1>
            <p className="mb-5 text-sm text-gray-500">
                Verify top-ups, review the ledger and control wallet availability.
            </p>

            <WalletStatsBar />
            <WalletTabs />

            {children}
        </div>
    );
}
