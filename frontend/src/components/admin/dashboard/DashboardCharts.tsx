"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ordersData = [
    { name: 'Mon', orders: 45 },
    { name: 'Tue', orders: 52 },
    { name: 'Wed', orders: 38 },
    { name: 'Thu', orders: 65 },
    { name: 'Fri', orders: 48 },
    { name: 'Sat', orders: 72 },
    { name: 'Sun', orders: 55 },
];

const revenueData = [
    { name: 'Mon', revenue: 4500 },
    { name: 'Tue', revenue: 5200 },
    { name: 'Wed', revenue: 3800 },
    { name: 'Thu', revenue: 6500 },
    { name: 'Fri', revenue: 4800 },
    { name: 'Sat', revenue: 7200 },
    { name: 'Sun', revenue: 5500 },
];

const statusData = [
    { name: 'Pending', value: 45, color: '#f59e0b' },
    { name: 'Processing', value: 28, color: '#6366f1' },
    { name: 'Completed', value: 1156, color: '#22c55e' },
    { name: 'Failed', value: 12, color: '#ef4444' },
    { name: 'Cancelled', value: 8, color: '#94a3b8' },
];

export default function DashboardCharts() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-6">

            {/* Orders Trend */}
            <div className="bg-card border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-6">Orders Trend</h3>
                <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ordersData}>
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
            <div className="bg-card border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-6">Revenue Trend</h3>
                <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
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
            <div className="bg-card border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-6">Order Status Distribution</h3>
                <div className="h-[200px] md:h-[300px] w-full flex justify-center items-center">
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
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Payment Status Breakdown - For Later or Empty for now */}
            <div className="bg-card border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-6">Payment Method Split</h3>
                <div className="h-[200px] md:h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/50">
                    <p>Insufficient Data</p>
                </div>
            </div>

        </div>
    );
}
