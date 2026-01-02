"use client";

import { useState, useEffect } from "react";
import { TbFilter, TbX, TbCalendar, TbSearch, TbActivity, TbBox } from "react-icons/tb";

interface Props {
    onFilterChange: (filters: {
        module?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    }) => void;
}

const MODULES = [
    "dashboard",
    "users",
    "banners",
    "games",
    "products",
    "blogs",
    "orders",
    "payments",
    "settings",
    "other",
];

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN"];

export default function LogsToolbar({ onFilterChange }: Props) {
    const [module, setModule] = useState("");
    const [action, setAction] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Debounce or effect to trigger parent
    useEffect(() => {
        onFilterChange({
            module: module || undefined,
            action: action || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
    }, [module, action, startDate, endDate, onFilterChange]);

    const clearFilters = () => {
        setModule("");
        setAction("");
        setStartDate("");
        setEndDate("");
    };

    const hasFilters = module || action || startDate || endDate;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/80 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Header / Title for Filters */}
                <div className="flex items-center gap-2 text-gray-800">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <TbFilter size={20} />
                    </div>
                    <span className="font-semibold text-sm uppercase tracking-wide text-gray-500">Filters</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

                    {/* Module Filter */}
                    <div className="relative group">
                        <TbBox className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
                        <select
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-white hover:border-blue-300 transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[160px]"
                        >
                            <option value="">All Modules</option>
                            {MODULES.map((m) => (
                                <option key={m} value={m}>
                                    {m.charAt(0).toUpperCase() + m.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Filter */}
                    <div className="relative group">
                        <TbActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-white hover:border-blue-300 transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="">All Actions</option>
                            {ACTIONS.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Group */}
                    <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl p-1">
                        <div className="relative">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-3 pr-2 py-1.5 bg-transparent text-sm text-gray-600 outline-none border-none focus:ring-0 cursor-pointer"
                                placeholder="Start"
                            />
                        </div>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <div className="relative">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-2 pr-2 py-1.5 bg-transparent text-sm text-gray-600 outline-none border-none focus:ring-0 cursor-pointer"
                                placeholder="End"
                            />
                        </div>
                    </div>

                    {/* Clear Button */}
                    <button
                        onClick={clearFilters}
                        disabled={!hasFilters}
                        className={`
                            ml-2 p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2 text-sm font-medium cursor-pointer
                            ${hasFilters
                                ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 shadow-sm"
                                : "border-transparent text-gray-300 cursor-not-allowed"
                            }
                        `}
                        title="Clear Filters"
                    >
                        <TbX size={18} />
                        {hasFilters && <span className="hidden sm:inline">Clear</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}
