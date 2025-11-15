"use client";

import React from "react";

export function AdminSidebar() {
    return (
        <aside className="hidden md:block col-span-3 lg:col-span-2">
            <div className="sticky top-6 rounded-lg border bg-white p-4 space-y-2 text-sm">
                <div className="font-medium text-gray-700 mb-2">Navigation</div>
                <a className="block text-blue-700 hover:underline" href="/admin/dashboard">Overview</a>
                <a className="block text-blue-700 hover:underline" href="/admin/dashboard/users">Users</a>
                <a className="block text-blue-700 hover:underline" href="/admin/dashboard/analytics">Analytics</a>
            </div>
        </aside>
    );
}
