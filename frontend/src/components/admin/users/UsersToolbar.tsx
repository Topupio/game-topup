"use client";

import { useState, useEffect } from "react";
import { TbSearch, TbFilter, TbX, TbUserShield, TbLock } from "react-icons/tb";

interface Props {
    onFilterChange: (filters: {
        search?: string;
        role?: string;
        status?: string;
    }) => void;
}

export default function UsersToolbar({ onFilterChange }: Props) {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");

    // Debounce effect for search & filters
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({
                search: search || undefined,
                role: role || undefined,
                status: status || undefined,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [search, role, status, onFilterChange]);

    const clearFilters = () => {
        setSearch("");
        setRole("");
        setStatus("");
    };

    const hasFilters = search || role || status;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/80 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                    <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

                    {/* Role Filter */}
                    <div className="relative group">
                        <TbUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-white hover:border-blue-300 transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="relative group">
                        <TbLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-white hover:border-blue-300 transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
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
