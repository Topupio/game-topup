"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import AccountSidebar from "@/components/user/account/AccountSidebar";
import AccountOrdersList from "@/components/user/account/AccountOrdersList";

export default function AccountPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user]);

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
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 animate-pulse">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-1/2" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4">
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
                {/* Left Sidebar */}
                <div className="w-full lg:w-72 shrink-0">
                    <AccountSidebar user={user} onLogout={handleLogout} />
                </div>

                {/* Right Content - Orders with Tabs */}
                <div className="flex-1 min-w-0">
                    <AccountOrdersList />
                </div>
            </div>
        </div>
    );
}
