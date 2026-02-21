"use client";

import { Order, ListOrderResponse } from "@/services/orders/types";
import Link from "next/link";
import { RiTimeLine, RiInformationLine, RiHistoryLine } from "react-icons/ri";
import Pagination from "@/components/user/categories/Pagination";

interface Props {
    initialData: ListOrderResponse;
}

export default function UserOrdersClient({ initialData }: Props) {
    const { orders, pagination } = initialData.data;

    const getStatusStyles = (status: Order['orderStatus']) => {
        switch (status) {
            case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "cancelled":
            case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <RiHistoryLine className="text-secondary text-3xl" />
                <h1 className="text-3xl font-bold text-white">My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <RiInformationLine className="text-gray-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
                    <p className="text-gray-400 mb-6">You haven't placed any orders yet. Explore our games and products!</p>
                    <Link href="/games" className="inline-block bg-secondary text-gray-900 font-bold px-8 py-3 rounded-xl hover:bg-tertiary transition">
                        Browse Games
                    </Link>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            href={`/orders/${order._id}`}
                            className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 relative">
                                        {order.game?.imageUrl ? (
                                            <img src={order.game.imageUrl} alt={order.game.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-secondary font-bold text-sm tracking-wider uppercase">{order.orderId}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusStyles(order.orderStatus)}`}>
                                                {order.orderStatus.toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-secondary transition">{order.productSnapshot.name}</h3>
                                        <p className="text-gray-400 text-sm" suppressHydrationWarning>{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                    <span className="text-xl font-bold text-white">₹{order.amount}</span>
                                    {order.paymentStatus === "pending" ? (
                                        <span className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-semibold">
                                            Pay Now
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <RiTimeLine />
                                            <span>Est. {order.productSnapshot.deliveryTime}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="lg:col-span-2">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
