'use client';

import React from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

type Props = {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
};

const AdminNavbar: React.FC<Props> = ({ isCollapsed, setIsCollapsed }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-[70px] border-b bg-white z-50">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Toggle sidebar"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded border hover:bg-gray-50"
                    >
                        {isCollapsed ? <FaBars /> : <FaTimes />}
                    </button>
                    <Link href="/admin/dashboard" className="text-xl font-semibold">
                        Admin
                    </Link>
                </div>

                <nav className="hidden sm:flex items-center gap-4 text-sm">
                    <Link className="text-blue-600 hover:underline" href="/admin/dashboard">Dashboard</Link>
                    <Link className="text-blue-600 hover:underline" href="/admin/dashboard/users">Users</Link>
                    <Link className="text-blue-600 hover:underline" href="/admin/dashboard/analytics">Analytics</Link>
                </nav>
            </div>
        </header>
    );
};

export default AdminNavbar;
