"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBell } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

const AdminNavbar = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            router.push("/admin/login");
        } catch {
            toast.error("Logout failed");
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-gray-200 shadow-sm z-50">
            <div className="w-full h-full px-6 flex items-center justify-between">
                <Link
                    href="/admin/dashboard"
                    className="text-xl font-semibold tracking-tight text-gray-800"
                >
                    Admin Panel
                </Link>

                <div className="flex items-center gap-5">
                    <button className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-100 transition">
                        <FaBell size={18} className="text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-300 hover:border-red-300 transition disabled:opacity-50"
                    >
                        <FiLogOut size={16} />
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;