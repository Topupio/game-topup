"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import AccountSidebar from "@/components/user/account/AccountSidebar";

/**
 * Page frame for the account area: sidebar on the left, content on the right.
 *
 * Every /account route renders through this, so the sidebar, the auth redirect and
 * the loading state exist once instead of being copied into each page.
 */
export default function AccountShell({ children }: { children: React.ReactNode }) {
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
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
                <div className="w-full lg:w-72 shrink-0">
                    <AccountSidebar user={user} onLogout={handleLogout} />
                </div>

                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    );
}
