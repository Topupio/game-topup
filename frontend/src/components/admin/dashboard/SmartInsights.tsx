"use client";

import { RiLightbulbFlashLine, RiFireLine, RiFundsLine, RiLineChartLine } from "react-icons/ri";
import { DashboardInsight } from "@/services/dashboard/types";

const ICONS = {
    warning: RiLightbulbFlashLine,
    top: RiFireLine,
    up: RiLineChartLine,
    down: RiFundsLine,
};

export default function SmartInsights({ insights = [] }: { insights?: DashboardInsight[] }) {
    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg rounded-xl p-3 md:p-6">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                <RiLightbulbFlashLine className="text-yellow-300" /> Smart Insights
            </h3>
            <div className="space-y-3">
                {insights.length === 0 && (
                    <p className="text-sm opacity-80">Nothing to flag right now.</p>
                )}
                {insights.map((insight, index) => {
                    const Icon = ICONS[insight.type] ?? RiLightbulbFlashLine;
                    return (
                    <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-lg flex items-start gap-3">
                        <div className={`p-1.5 rounded-full bg-white/20 text-white shrink-0`}>
                            <Icon size={16} />
                        </div>
                        <p className="text-sm font-medium opacity-90 leading-tight pt-0.5">{insight.message}</p>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
