"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { Order, OrderParams, OrderStatus } from "@/services/orders/types";
import { RiTimeLine, RiInformationLine } from "react-icons/ri";
import OrderStatusTabs from "./OrderStatusTabs";
import AccountPagination from "./AccountPagination";

interface PaginationState {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AccountOrdersList() {
    const [activeStatus, setActiveStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        total: 0, page: 1, limit: 10, totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const params: OrderParams = { page, limit: 10 };
        if (activeStatus !== "all") params.status = activeStatus as OrderStatus;

        ordersApiClient.getMyOrders(params, controller.signal)
            .then((res) => {
                setOrders(res.data.orders);
                setPagination(res.data.pagination);
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError("Failed to load orders");
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [activeStatus, page]);

    const handleTabChange = (status: string) => {
        setActiveStatus(status);
        setPage(1);
    };

    const getStatusStyles = (status: Order["orderStatus"]) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 border-green-200";
            case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
            case "cancelled":
            case "failed": return "bg-red-100 text-red-700 border-red-200";
            case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground">Order History</h2>
                <p className="text-sm text-muted-foreground mt-1">Track the status of your placed orders and view their details.</p>
            </div>
            <OrderStatusTabs activeTab={activeStatus} onTabChange={handleTabChange} />

            <div className="mt-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                        <div className="h-5 bg-muted rounded w-1/2" />
                                        <div className="h-3 bg-muted rounded w-1/4" />
                                    </div>
                                    <div className="h-6 bg-muted rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                        <RiInformationLine className="text-muted-foreground text-5xl mx-auto mb-4" />
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                        <RiInformationLine className="text-muted-foreground text-5xl mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-foreground mb-2">No orders found</h2>
                        <p className="text-muted-foreground mb-6">
                            {activeStatus === "all"
                                ? "You haven't placed any orders yet."
                                : `No ${activeStatus} orders found.`}
                        </p>
                        <Link
                            href="/games"
                            className="inline-block bg-secondary text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition"
                        >
                            Browse Games
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order._id}
                                href={`/orders/${order._id}`}
                                className="block bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-secondary/30 transition group"
                            >
                                {/* Header: Date, Order ID, Game, Status */}
                                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span suppressHydrationWarning>
                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                        <span className="text-border">|</span>
                                        <span className="text-secondary font-medium">{order.orderId}</span>
                                        {order.game?.name && (
                                            <>
                                                <span className="text-border">|</span>
                                                <span>{order.game.name}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getStatusStyles(order.orderStatus)}`}>
                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </span>
                                </div>

                                {/* Body: Image + Details + Price */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                                        {order.game?.imageUrl ? (
                                            <img
                                                src={order.game.imageUrl}
                                                alt={order.game.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                No Img
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-foreground group-hover:text-secondary transition truncate">
                                            {order.productSnapshot.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            ${order.productSnapshot.discountedPrice ?? order.productSnapshot.price} x 1
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-bold text-foreground">${order.amount}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <RiTimeLine />
                                            <span>{order.productSnapshot.deliveryTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {pagination.totalPages > 1 && (
                            <AccountPagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={setPage}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
