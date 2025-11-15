"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const isLoginRoute = pathname === "/admin/login";

    useEffect(() => {
        if (!loading && !isLoginRoute) {
            if (!user) {
                router.replace("/login");
                return;
            }
            if (user.role !== "admin") {
                router.replace("/");
            }
        }
    }, [loading, user, router, isLoginRoute]);

    if (!isLoginRoute && (loading || !user || user.role !== "admin")) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            </div>
        );
    }

    if (isLoginRoute) {
        // Plain container for login page
        return <div className="max-w-lg mx-auto px-4 py-10">{children}</div>;
    }

    return (
        <div className="min-h-screen grid grid-rows-[auto,1fr]">
            <AdminNavbar />
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-6 w-full">
                <AdminSidebar />
                <main className="col-span-12 md:col-span-9 lg:col-span-10">{children}</main>
            </div>
        </div>
    );
}
