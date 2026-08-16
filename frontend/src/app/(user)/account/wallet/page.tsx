import type { Metadata } from "next";
import AccountShell from "@/components/user/account/AccountShell";
import WalletPageClient from "@/components/user/wallet/WalletPageClient";

export const metadata: Metadata = {
    title: "Wallet",
    description: "Your Topupio wallet balance and transaction history.",
    robots: { index: false, follow: false },
};

export default function WalletPage() {
    return (
        <AccountShell>
            <WalletPageClient />
        </AccountShell>
    );
}
