import { DashboardStats } from "@/services/dashboard/types";
import { RiStackLine, RiTimeLine, RiLoader4Line, RiCheckboxCircleLine, RiMoneyDollarCircleLine, RiCalendarCheckLine, RiGroupLine, RiUserForbidLine } from "react-icons/ri";

export default function StatsCards({ data }: { data: DashboardStats }) {
    const stats = [
        { label: "Total Orders", value: data.orders.total, change: "+12.5%", trend: "up", icon: RiStackLine, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Pending Orders", value: data.orders.pending, change: "+5.2%", trend: "up", icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Processing", value: data.orders.processing, change: "-2.1%", trend: "down", icon: RiLoader4Line, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        { label: "Completed", value: data.orders.completed, change: "+18.2%", trend: "up", icon: RiCheckboxCircleLine, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Total Revenue", value: `$${(data.revenue.total / 1_000_000).toFixed(1)}M`, change: "+8.4%", trend: "up", icon: RiMoneyDollarCircleLine, color: "text-emerald-600", bg: "bg-emerald-500/10" },
        { label: "Today's Revenue", value: `$${(data.revenue.today / 1_000_000).toFixed(1)}M`, change: "+22.5%", trend: "up", icon: RiCalendarCheckLine, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        { label: "Total Users", value: data.users.total, change: "+120", trend: "up", icon: RiGroupLine, color: "text-violet-500", bg: "bg-violet-500/10" },
        { label: "Blocked Users", value: data.users.blocked, change: "+2", trend: "down", icon: RiUserForbidLine, color: "text-red-500", bg: "bg-red-500/10" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs md:text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-lg md:text-2xl font-bold mt-1 md:mt-2 text-gray-900">{stat.value}</h3>
                        </div>
                        <div className={`p-2 md:p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                    </div>
                    <div className="mt-2 md:mt-4 flex items-center text-[10px] md:text-xs">
                        <span className={stat.trend === "up" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {stat.change}
                        </span>
                        <span className="text-gray-400 ml-2">from last month</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
