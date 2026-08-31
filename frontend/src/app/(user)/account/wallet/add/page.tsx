import type { Metadata } from "next";
import AccountShell from "@/components/user/account/AccountShell";
import AddMoneyFlow from "@/components/user/wallet/AddMoneyFlow";

export const metadata: Metadata = {
    title: "Add Money",
    description: "Add money to your Topupio wallet.",
    robots: { index: false, follow: false },
};

export default function AddMoneyPage() {
    return (
        <AccountShell title="Add Money" backHref="/account/wallet">
            <AddMoneyFlow />
        </AccountShell>
    );
}
