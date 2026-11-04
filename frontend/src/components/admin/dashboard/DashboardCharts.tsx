"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import { DashboardCharts as DashboardChartsData } from "@/services/dashboard/types";

const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    paid: '#0ea5e9',
    processing: '#6366f1',
    completed: '#22c55e',
    failed: '#ef4444',
    cancelled: '#94a3b8',
    expired: '#a1a1aa',
    refunded: '#ec4899',
};

const METHOD_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#0ea5e9', '#ec4899', '#14b8a6', '#94a3b8'];

const EmptyState = () => (
    <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
        <p>No data yet</p>
    </div>
);

export default function DashboardCharts({ charts }: { charts?: DashboardChartsData }) {
    const daily = charts?.daily ?? [];
    const statusData = charts?.orderStatus ?? [];
    const methodData = charts?.paymentMethods ?? [];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-6">

            {/* Orders Trend */}
            <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-6">Orders Trend</h3>
                <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={daily}>
                            <defs>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-6">Revenue Trend</h3>
                <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={daily}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-6">Order Status Distribution</h3>
                <div className="h-[200px] md:h-[300px] w-full flex justify-center items-center">
                    {statusData.length === 0 ? <EmptyState /> : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Payment Method Split (paid orders) */}
            <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-6">Payment Method Split</h3>
                <div className="h-[200px] md:h-[300px] w-full flex justify-center items-center">
                    {methodData.length === 0 ? <EmptyState /> : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={methodData}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {methodData.map((entry, index) => (
                                    <Cell key={`method-${index}`} fill={METHOD_COLORS[index % METHOD_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </div>

        </div>
    );
}
