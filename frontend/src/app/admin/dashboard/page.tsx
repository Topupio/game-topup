import { dashboardApiServer } from "@/services/dashboard/dashboardApiServer";

import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import ActionRequiredPanel from "@/components/admin/dashboard/ActionRequiredPanel";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import SystemHealthPanel from "@/components/admin/dashboard/SystemHealthPanel";
import AdminActivityFeed from "@/components/admin/dashboard/AdminActivityFeed";
import SmartInsights from "@/components/admin/dashboard/SmartInsights";
import QuickActions from "@/components/admin/dashboard/QuickActions";

export default async function AdminDashboardPage() {
    const data = await dashboardApiServer.get();

    return (
        <div className="p-6 w-full space-y-4 relative">

            {/* Header */}
            <AdminToolbar title="Dashboard" />

            {/* 1. Executive Summary Cards */}
            <StatsCards data={data} />

            {/* 2. Live Business Charts */}
            <DashboardCharts />

            {/* 3. System Health Snapshot */}
            <SystemHealthPanel health={data?.systemHealth} />

            {/* 4. Panels Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent Orders (Spans 2 cols) */}
                <div className="xl:col-span-2">
                    <RecentOrdersTable orders={data?.recentOrders} />
                </div>

                {/* Action Required (Spans 1 col) */}
                <div className="xl:col-span-1 h-full">
                    <ActionRequiredPanel actions={data?.actionRequired} />
                </div>
            </div>

            {/* 5. Bottom Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AdminActivityFeed activities={data?.recentActivity} />
                <SmartInsights />
            </div>

            {/* 6. Quick Actions (Floating) */}
            <QuickActions />

        </div>
    );
}