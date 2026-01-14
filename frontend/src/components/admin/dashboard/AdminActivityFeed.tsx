"use client";

import {
    RiUser3Line,
    RiShoppingCartLine,
    RiUserForbidLine,
    RiEdit2Line,
    RiRefund2Line,
    RiLoginCircleLine,
    RiDeleteBinLine,
} from "react-icons/ri";
import { DashboardActivity } from "@/services/dashboard/types";
import Link from "next/link";

/* -------------------------------------------------- */
/* 🧠 Action Style System */
/* -------------------------------------------------- */

type ActionStyle = {
    match: string[];
    icon: any;
    color: string;
    bg: string;
    border: string;
};

const ACTION_STYLES: ActionStyle[] = [
    {
        match: ["login"],
        icon: RiLoginCircleLine,
        color: "text-blue-600",
        bg: "bg-blue-500/10",
        border: "border-blue-200",
    },
    {
        match: ["create"],
        icon: RiShoppingCartLine,
        color: "text-green-600",
        bg: "bg-green-500/10",
        border: "border-green-200",
    },
    {
        match: ["update", "edit"],
        icon: RiEdit2Line,
        color: "text-amber-600",
        bg: "bg-amber-500/10",
        border: "border-amber-200",
    },
    {
        match: ["delete", "remove"],
        icon: RiDeleteBinLine,
        color: "text-red-600",
        bg: "bg-red-500/10",
        border: "border-red-200",
    },
    {
        match: ["block"],
        icon: RiUserForbidLine,
        color: "text-red-600",
        bg: "bg-red-500/10",
        border: "border-red-200",
    },
    {
        match: ["refund"],
        icon: RiRefund2Line,
        color: "text-purple-600",
        bg: "bg-purple-500/10",
        border: "border-purple-200",
    },
];

const DEFAULT_STYLE = {
    icon: RiEdit2Line,
    color: "text-gray-600",
    bg: "bg-gray-500/10",
    border: "border-gray-200",
};

function getIconAndStyle(action: string) {
    const lower = action.toLowerCase();
    return (
        ACTION_STYLES.find((rule) =>
            rule.match.some((keyword) => lower.includes(keyword))
        ) || DEFAULT_STYLE
    );
}

/* -------------------------------------------------- */
/* 🕒 Time Formatting */
/* -------------------------------------------------- */

function timeAgo(dateInput: string | Date) {
    const date = new Date(dateInput).getTime();
    const now = Date.now();
    const seconds = Math.max(0, Math.floor((now - date) / 1000));

    const units = [
        { label: "year", value: 31536000 },
        { label: "month", value: 2592000 },
        { label: "day", value: 86400 },
        { label: "hour", value: 3600 },
        { label: "minute", value: 60 },
        { label: "second", value: 1 },
    ];

    for (const unit of units) {
        const amount = Math.floor(seconds / unit.value);
        if (amount >= 1) {
            return `${amount} ${unit.label}${amount > 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
}

/* -------------------------------------------------- */
/* 🧱 Component */
/* -------------------------------------------------- */

interface Props {
    activities?: DashboardActivity[];
}

export default function AdminActivityFeed({ activities = [] }: Props) {
    if (activities.length === 0) {
        return (
            <div className="bg-white border shadow-sm rounded-xl p-6 h-full flex flex-col items-center justify-center text-gray-400">
                <RiUser3Line size={48} className="mb-3 opacity-20" />
                <p>No recent activity</p>
            </div>
        );
    }

    return (
        <div className="bg-white border shadow-sm rounded-xl p-6 h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                Recent Activity
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
                    Real-time
                </span>
            </h2>

            <div className="space-y-0 relative before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
                {activities.slice(0, 10).map((activity) => {
                    const style = getIconAndStyle(activity.action);

                    return (
                        <div key={activity._id} className="relative pl-14 py-3 group">
                            <div
                                className={`absolute left-0 top-3 w-12 h-12 flex items-center justify-center rounded-xl z-10 transition-all duration-300
                  ${style.bg} ${style.color} border ${style.border}
                  group-hover:scale-110 shadow-sm`}
                            >
                                <style.icon size={20} />
                            </div>

                            <div className="flex flex-col">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    <span className="font-bold text-gray-900">
                                        {activity.admin?.name || "System"}
                                    </span>
                                    <span className="mx-1 text-gray-500">
                                        {activity.description}
                                    </span>
                                </p>

                                <span className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1">
                                    {timeAgo(activity.createdAt)} •{" "}
                                    <span className="uppercase text-[10px] tracking-wider bg-gray-100 px-1.5 rounded text-gray-500">
                                        {activity.module}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Link
                href="/admin/logs"
                className="block w-full text-center mt-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium border border-dashed border-gray-200 rounded-lg hover:border-gray-400 transition"
            >
                View User Activity Log
            </Link>
        </div>
    );
}
