"use client";

import { useState } from "react";
import AdminNavbar from "@/components/admin/shared/AdminNavbar";
import AdminSidebar from "@/components/admin/shared/AdminSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="w-full h-screen bg-[#f5f6fa] flex flex-col overflow-hidden">
            <AdminNavbar />

            <div className="flex flex-1 relative">
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                <main
                    className={`flex-1 px-6 py-6 transition-all duration-300 mt-[70px] ${
                        isCollapsed ? "ml-20" : "ml-68"
                    }`}
                >
                    <div className="bg-white shadow-sm rounded-xl p-6 min-h-[calc(100vh-120px)] animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
