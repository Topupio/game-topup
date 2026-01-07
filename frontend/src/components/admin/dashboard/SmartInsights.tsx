"use client";

import { RiLightbulbFlashLine, RiFireLine, RiFundsLine } from "react-icons/ri";

export default function SmartInsights() {
    const insights = [
        { message: "12 orders are pending for more than 24 hours", icon: RiLightbulbFlashLine, color: "text-amber-500", bg: "bg-amber-50" },
        { message: "PUBG UC is the most sold product this week", icon: RiFireLine, color: "text-orange-500", bg: "bg-orange-50" },
        { message: "Revenue dropped 15% compared to last week", icon: RiFundsLine, color: "text-red-500", bg: "bg-red-50" },
    ];

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <RiLightbulbFlashLine className="text-yellow-300" /> Smart Insights
            </h3>
            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-lg flex items-start gap-3">
                        <div className={`p-1.5 rounded-full bg-white/20 text-white shrink-0`}>
                            <insight.icon size={16} />
                        </div>
                        <p className="text-sm font-medium opacity-90 leading-tight pt-0.5">{insight.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
