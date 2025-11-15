"use client";

import React from "react";

export function AdminNavbar() {
    return (
        <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Admin</h1>
                <nav className="text-sm space-x-4">
                    <a className="text-blue-600 hover:underline" href="/admin/dashboard">Dashboard</a>
                    <a className="text-blue-600 hover:underline" href="/admin/dashboard/users">Users</a>
                    <a className="text-blue-600 hover:underline" href="/admin/dashboard/analytics">Analytics</a>
                </nav>
            </div>
        </header>
    );
}
