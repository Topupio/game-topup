"use client";

import { RiUser3Line } from "react-icons/ri";

export default function AdminActivityFeed() {
    const activities = [
        { user: "Admin A", action: "created new product", target: "PUBG UC", time: "10 mins ago", color: "text-blue-600" },
        { user: "Admin B", action: "marked Order #A72F as", target: "completed", time: "25 mins ago", color: "text-green-600" },
        { user: "Admin A", action: "blocked user", target: "user@email.com", time: "1 hour ago", color: "text-red-600" },
        { user: "Admin C", action: "updated game details for", target: "Free Fire", time: "2 hours ago", color: "text-amber-600" },
        { user: "Admin B", action: "refunded Order", target: "#B98C", time: "3 hours ago", color: "text-gray-600" },
    ];

    return (
        <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Activity Feed</h3>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {activities.map((activity, index) => (
                    <div key={index} className="relative pl-10">
                        <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-full z-10 shadow-sm">
                            <RiUser3Line className="text-gray-400" size={16} />
                        </div>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{activity.user}</span> {activity.action} <span className={`font-medium ${activity.color}`}>{activity.target}</span>
                        </p>
                        <span className="text-xs text-gray-400 mt-1 block">{activity.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
