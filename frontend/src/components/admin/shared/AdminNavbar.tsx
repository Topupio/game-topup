"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBell } from "react-icons/fa";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import ThemeToggle from "@/components/user/shared/ThemeToggle";

interface AdminNavbarProps {
    onMenuToggle: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMenuToggle }) => {
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
        <header className="fixed top-0 left-0 right-0 h-[70px] bg-card border-b border-border shadow-sm z-50">
            <div className="w-full h-full px-3 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Hamburger menu - mobile only */}
                    <button
                        onClick={onMenuToggle}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition"
                    >
                        <FiMenu size={20} className="text-muted-foreground" />
                    </button>

                    <Link
                        href="/admin/dashboard"
                        className="text-lg md:text-xl font-semibold tracking-tight text-foreground"
                    >
                        Admin Panel
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:gap-5">
                    <ThemeToggle variant="light" />

                    <button className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition">
                        <FaBell size={18} className="text-muted-foreground" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg border border-border hover:border-red-300 transition disabled:opacity-50"
                    >
                        <FiLogOut size={16} />
                        <span className="hidden sm:inline">
                            {loggingOut ? "Logging out..." : "Logout"}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;
