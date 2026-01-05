"use client";

import { Order } from "@/services/orders/types";
import Link from "next/link";
import {
    RiArrowLeftLine,
    RiTimeLine,
    RiCheckboxCircleLine,
    RiMapPinLine,
    RiWallet3Line,
    RiFileListLine
} from "react-icons/ri";

interface Props {
    order: Order;
}

export default function UserOrderDetailClient({ order }: Props) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "cancelled":
            case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        }
    };

    return (
        <div className="min-h-screen bg-primary pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                <Link href="/orders" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition w-fit">
                    <RiArrowLeftLine /> Back to My Orders
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Header */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-secondary font-bold tracking-wider uppercase">Order {order.orderId}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusStyles(order.orderStatus)}`}>
                                            {order.orderStatus.toUpperCase()}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-white">{order.productSnapshot.name}</h1>
                                </div>
                                <span className="text-2xl font-bold text-white">₹{order.amount}</span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-400 border-t border-white/10 pt-6">
                                <div className="flex items-center gap-2">
                                    <RiTimeLine className="text-secondary" />
                                    <span>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RiWallet3Line className="text-secondary" />
                                    <span>Payment: {order.paymentMethod?.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* User Inputs / Game Details */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                                <RiFileListLine className="text-secondary" />
                                <h2>Account Details</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {order.userInputs.map((input, index) => (
                                    <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{input.label}</p>
                                        <p className="text-white font-semibold break-all">{input.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Tracking */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                                <RiCheckboxCircleLine className="text-secondary" />
                                <h2>Order Timeline</h2>
                            </div>
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                {order.tracking.map((track, index) => (
                                    <div key={index} className="relative pl-8">
                                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-primary ${index === order.tracking.length - 1 ? 'bg-secondary' : 'bg-gray-600'}`}></div>
                                        <div>
                                            <p className="text-white font-semibold text-sm uppercase tracking-wide">{track.status}</p>
                                            <p className="text-gray-400 text-sm">{track.message}</p>
                                            <p className="text-gray-500 text-xs mt-1">{new Date(track.at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar Info */}
                    <div className="space-y-6">
                        {/* Game Info Card */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-4 border border-white/10 bg-white/5 p-1">
                                    {order.game?.imageUrl ? (
                                        <img src={order.game.imageUrl} alt={order.game.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{order.game?.name}</h3>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                    <RiMapPinLine className="text-secondary" />
                                    <span>Global Delivery</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Support Card */}
                        <div className="bg-gradient-to-br from-secondary/20 to-tertiary/20 border border-white/10 p-6 rounded-2xl">
                            <h3 className="text-white font-bold mb-2">Need Help?</h3>
                            <p className="text-gray-400 text-sm mb-4">If you have any issues with your order, please contact our support team with your Order ID.</p>
                            <Link href="/support" className="block w-full text-center bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition">
                                Contact Support
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
