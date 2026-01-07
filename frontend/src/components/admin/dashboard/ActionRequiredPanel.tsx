"use client";

import { RiAlertFill, RiErrorWarningFill, RiTimeFill, RiUserUnfollowFill } from "react-icons/ri";
import Link from "next/link";

export default function ActionRequiredPanel() {
    const actions = [
        { label: "Orders waiting for processing", count: 5, icon: RiAlertFill, color: "text-amber-500", bg: "bg-amber-500/10", href: "/admin/orders?status=processing" },
        { label: "Failed orders", count: 2, icon: RiErrorWarningFill, color: "text-red-500", bg: "bg-red-500/10", href: "/admin/orders?status=failed" },
        { label: "Pending payments", count: 12, icon: RiTimeFill, color: "text-blue-500", bg: "bg-blue-500/10", href: "/admin/orders?status=pending" },
        { label: "Recently blocked users", count: 3, icon: RiUserUnfollowFill, color: "text-gray-500", bg: "bg-gray-500/10", href: "/admin/users?status=blocked" },
        { label: "Old pending orders (>24h)", count: 8, icon: RiTimeFill, color: "text-orange-500", bg: "bg-orange-500/10", href: "/admin/orders?status=pending" },
    ];

    return (
        <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Required</h3>
            <div className="space-y-4">
                {actions.map((action, index) => (
                    <Link key={index} href={action.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${action.bg} ${action.color}`}>
                                <action.icon size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">{action.label}</span>
                        </div>
                        <span className={`text-sm font-bold ${action.color} bg-white px-2 py-0.5 rounded-full border shadow-sm`}>
                            {action.count}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
