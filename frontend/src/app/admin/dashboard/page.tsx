"use client";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Overview</h2>
                <p className="text-sm text-gray-600">Key stats and quick actions for administrators.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 bg-white">
                    <div className="text-sm text-gray-500">Total Users</div>
                    <div className="text-2xl font-bold mt-1">—</div>
                </div>
                <div className="rounded-lg border p-4 bg-white">
                    <div className="text-sm text-gray-5 00">Orders Today</div>
                    <div className="text-2xl font-bold mt-1">—</div>
                </div>
                <div className="rounded-lg border p-4 bg-white">
                    <div className="text-sm text-gray-500">Revenue (24h)</div>
                    <div className="text-2xl font-bold mt-1">—</div>
                </div>
            </div>

            <div className="rounded-lg border p-4 bg-white">
                <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
                <div className="text-sm text-gray-600">No data yet.</div>
            </div>
        </div>
    );
}
