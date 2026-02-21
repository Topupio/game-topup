"use client";

import { useState } from "react";
import { Order } from "@/services/orders/types";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { toast } from "react-toastify";
import Link from "next/link";
import {
    RiArrowLeftLine,
    RiFileListLine,
    RiUser3Line,
    RiShoppingBag3Line,
    RiCheckLine,
    RiCloseLine,
    RiLoader4Line,
    RiTimeLine,
} from "react-icons/ri";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";

interface Props {
    initialOrder: Order;
}

export default function OrderDetailPage({ initialOrder }: Props) {
    const [order, setOrder] = useState<Order>(initialOrder);
    const [updating, setUpdating] = useState(false);

    // Form states
    const [status, setStatus] = useState(order.orderStatus);
    const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
    const [adminNote, setAdminNote] = useState(order.adminNote || "");

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const res = await ordersApiClient.adminUpdateOrder(order._id, {
                orderStatus: status,
                paymentStatus,
                adminNote
            });
            if (res.success) {
                setOrder(res.data);
                toast.success("Order updated successfully");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update order");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "completed": return "text-green-600 bg-green-50 border-green-200";
            case "processing": return "text-blue-600 bg-blue-50 border-blue-200";
            case "cancelled":
            case "failed": return "text-red-600 bg-red-50 border-red-200";
            case "paid": return "text-purple-600 bg-purple-50 border-purple-200";
            default: return "text-yellow-600 bg-yellow-50 border-yellow-200";
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <Link href="/admin/orders" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition w-fit mb-2">
                <RiArrowLeftLine /> Back to Orders
            </Link>

            <AdminToolbar
                title={
                    <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-bold uppercase tracking-wider">Order #{order.orderId}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyles(order.orderStatus)}`}>
                            {order.orderStatus.toUpperCase()}
                        </span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Order Information */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer & Product Info Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                            <h2 className="text-gray-900 font-bold flex items-center gap-2 mb-4">
                                <RiUser3Line className="text-blue-600" />
                                Customer Info
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Name</p>
                                    <p className="text-gray-900 font-medium">{order.user?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Email</p>
                                    <p className="text-gray-900 font-medium">{order.user?.email || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                            <h2 className="text-gray-900 font-bold flex items-center gap-2 mb-4">
                                <RiShoppingBag3Line className="text-blue-600" />
                                Product Info
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Game / Product</p>
                                    <p className="text-gray-900 font-medium">{order.game?.name}</p>
                                    <p className="text-gray-500 text-xs">{order.productSnapshot.name}</p>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Amount</p>
                                        <p className="text-blue-600 font-bold text-lg">₹{order.amount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Method</p>
                                        <p className="text-gray-900 font-medium text-xs">{order.paymentMethod?.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Inputs Section */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                        <h2 className="text-gray-900 font-bold flex items-center gap-2 mb-6">
                            <RiFileListLine className="text-blue-600" />
                            Account Details (User Inputs)
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {order.userInputs.map((input, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 group hover:border-blue-400 transition relative">
                                    <p className="text-gray-500 text-[10px] mb-1 uppercase font-bold tracking-wider">{input.label}</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-gray-900 font-bold break-all">{input.value}</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(String(input.value));
                                                toast.info("Copied to clipboard");
                                            }}
                                            className="text-blue-600 opacity-0 group-hover:opacity-100 transition text-[10px] font-bold uppercase whitespace-nowrap hover:cursor-pointer"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                        <h2 className="text-gray-900 font-bold flex items-center gap-2 mb-6">
                            <RiTimeLine className="text-blue-600" />
                            Order Timeline
                        </h2>
                        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                            {order.tracking.map((track, i) => (
                                <div key={i} className="flex gap-4 items-start relative z-10">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${i === order.tracking.length - 1 ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                        <RiCheckLine className={`w-3 h-3 ${i === order.tracking.length - 1 ? 'text-white' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex justify-between items-start">
                                            <p className="text-gray-900 text-sm font-bold uppercase tracking-wide">{track.status}</p>
                                            <p className="text-gray-400 text-[10px]" suppressHydrationWarning>{new Date(track.at).toLocaleString()}</p>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-0.5">{track.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl sticky top-24">
                        <h2 className="text-gray-900 font-bold mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                            Update Order
                        </h2>

                        <div className="space-y-5">
                            {/* Order Status */}
                            <div>
                                <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block mb-2 px-1">Order Status</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            {/* Payment Status */}
                            <div>
                                <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block mb-2 px-1">Payment Status</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            {/* Admin Note */}
                            <div>
                                <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block mb-2 px-1">Internal Note / Tracking Info</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition h-32 resize-none"
                                    placeholder="Add notes for the user or tracking ID..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                {updating ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiCheckLine className="w-5 h-5" />}
                                Update Order
                            </button>

                            <div className="pt-2 flex gap-2">
                                <Link
                                    href="/admin/orders"
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                    <RiCloseLine /> Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
