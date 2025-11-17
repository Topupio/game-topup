"use client";

import { useState } from "react";
import AdminNavbar from "@/components/admin/shared/AdminNavbar";
import AdminSidebar from "@/components/admin/shared/AdminSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    return (
        <div className="flex flex-col h-screen">
            <AdminNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />

                <main
                    className={`flex-1 p-4 overflow-auto transition-all duration-300 ${
                        isCollapsed ? "ml-16" : "ml-64"
                    }`}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;