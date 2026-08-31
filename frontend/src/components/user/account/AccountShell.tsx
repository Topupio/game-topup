"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import AccountSidebar from "@/components/user/account/AccountSidebar";

interface AccountShellProps {
    children: React.ReactNode;
    /**
     * Set on sub-pages (Wallet, Settings, Order History). On mobile these are their own
     * screen reached from the /account menu, so the sidebar is replaced by a back link.
     * Left unset on /account itself, where the sidebar *is* the mobile menu.
     */
    title?: string;
    /** Where the mobile back link goes. Defaults to the account menu. */
    backHref?: string;
}

/**
 * Page frame for the account area: sidebar on the left, content on the right.
 *
 * Every /account route renders through this, so the sidebar, the auth redirect and
 * the loading state exist once instead of being copied into each page.
 */
export default function AccountShell({ children, title, backHref = "/account" }: AccountShellProps) {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4">
                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4">
            {title && (
                <div className="lg:hidden mb-4 flex items-center gap-2">
                    <Link
                        href={backHref}
                        aria-label="Go back"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600"
                    >
                        <RiArrowLeftSLine className="text-xl" />
                    </Link>
                    <h1 className="text-base font-bold text-gray-900">{title}</h1>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
                <div className={`w-full lg:w-72 shrink-0 ${title ? "hidden lg:block" : ""}`}>
                    <AccountSidebar user={user} onLogout={handleLogout} />
                </div>

                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    );
}
