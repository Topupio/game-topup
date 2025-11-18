"use client";

import { FaUsers, FaShoppingCart, FaDollarSign, FaHistory } from "react-icons/fa";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-semibold tracking-tight text-gray-800">Overview</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Key stats and quick insights for administrators.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Users</span>
                        <FaUsers className="text-gray-400" size={22} />
                    </div>
                    <div className="text-3xl font-bold mt-2">—</div>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Orders Today</span>
                        <FaShoppingCart className="text-gray-400" size={22} />
                    </div>
                    <div className="text-3xl font-bold mt-2">—</div>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Revenue (24h)</span>
                        <FaDollarSign className="text-gray-400" size={22} />
                    </div>
                    <div className="text-3xl font-bold mt-2">—</div>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Pending Tasks</span>
                        <FaHistory className="text-gray-400" size={22} />
                    </div>
                    <div className="text-3xl font-bold mt-2">—</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
                <p className="text-sm text-gray-500">No recent activity yet.</p>
            </div>
        </div>
    );
}