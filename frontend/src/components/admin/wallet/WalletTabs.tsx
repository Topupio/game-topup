"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { label: "Top-Up Queue", href: "/admin/wallet" },
    { label: "All Transactions", href: "/admin/wallet/transactions" },
    { label: "Settings", href: "/admin/wallet/settings" },
];

export default function WalletTabs() {
    const pathname = usePathname();

    return (
        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-gray-200">
            {TABS.map((tab) => {
                // The queue lives at the section root, so it needs an exact match —
                // otherwise it stays highlighted on every sub-route.
                const active =
                    tab.href === "/admin/wallet"
                        ? pathname === "/admin/wallet"
                        : pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                            active
                                ? "border-secondary text-secondary"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
