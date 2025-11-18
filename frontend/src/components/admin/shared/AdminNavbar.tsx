"use client";

import React from "react";
import Link from "next/link";
import { FaBell } from "react-icons/fa";

const AdminNavbar = () => {
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
                        A
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;