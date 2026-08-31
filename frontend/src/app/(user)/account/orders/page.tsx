import type { Metadata } from "next";
import AccountShell from "@/components/user/account/AccountShell";
import AccountOrdersList from "@/components/user/account/AccountOrdersList";

export const metadata: Metadata = {
    title: "Order History",
    description: "Track the status of your Topupio orders and view their details.",
    robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
    return (
        <AccountShell title="Order History">
            <AccountOrdersList />
        </AccountShell>
    );
}
