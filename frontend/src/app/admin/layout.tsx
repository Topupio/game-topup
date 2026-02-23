"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/ui/Loading";
import AdminNavbar from "@/components/admin/shared/AdminNavbar";
import AdminSidebar from "@/components/admin/shared/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const isLogin = pathname === "/admin/login";

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (loading || isLogin) return;
        if (!user) {
            router.replace("/admin/login");
            return;
        }
        if (user.role !== "admin") {
            router.replace("/");
        }
    }, [user, loading, isLogin, router]);

    // Avoid any UI render until auth check resolves (prevents flash)
    if (isLogin) return <div className="min-h-screen">{children}</div>;
    if (loading) return <Loading />; // or a tiny spinner

    // If not admin, early return null while redirect kicks in
    if (!user || user.role !== "admin") return null;

    return (
        <div className="w-full h-auto bg-background flex flex-col">
            <AdminNavbar onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />
            <div className="flex flex-1 relative">
                <AdminSidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobileOpen={isMobileOpen}
                    onMobileClose={() => setIsMobileOpen(false)}
                />
                <main className={`flex-1 px-3 py-4 md:px-6 md:py-6 transition-all duration-300 mt-[70px] ml-0 ${isCollapsed ? "md:ml-20" : "md:ml-68"}`}>
                    <div className="bg-card shadow-sm rounded-xl p-3 md:p-6 min-h-[calc(100vh-120px)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
