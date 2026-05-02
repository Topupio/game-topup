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
    RiQrCodeLine,
    RiFileCopyLine,
} from "react-icons/ri";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import { formatCurrencyAmount } from "@/lib/utils/formatCurrencyAmount";

interface Props {
    initialOrder: Order;
}

function getErrorMessage(error: unknown) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message;
    }

    return "Failed to update order";
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
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
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

    const orderCurrency = order.currency || "USD";
    const orderAmount = formatCurrencyAmount(order.amount, orderCurrency);
    const upiPayment = order.paymentInfo?.paymentGatewayResponse?.upi;
    const upiAmount = upiPayment ? formatCurrencyAmount(upiPayment.amount, upiPayment.currency) : null;
    const hasDifferentUpiAmount = Boolean(
        upiPayment &&
        (upiPayment.currency !== orderCurrency || upiPayment.amount !== order.amount)
    );

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
                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Order Amount</p>
                                        <p className="text-blue-600 font-bold text-lg">{orderAmount}</p>
                                        {hasDifferentUpiAmount && (
                                            <p className="text-gray-500 text-xs">UPI payable: {upiAmount}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Method</p>
                                        <p className="text-gray-900 font-medium text-xs">{order.paymentMethod?.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* UPI Payment Info — only for UPI orders */}
                    {order.paymentMethod === "upi" && (() => {
                        const upi = order.paymentInfo?.paymentGatewayResponse?.upi;
                        const utrNumber = order.paymentInfo?.utrNumber;
                        const utrSubmittedAt = order.paymentInfo?.utrSubmittedAt;

                        return (
                            <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                                <h2 className="text-gray-900 font-bold flex items-center gap-2 mb-4">
                                    <RiQrCodeLine className="text-blue-600" />
                                    UPI Payment Details
                                </h2>

                                {/* UTR highlight */}
                                <div className={`mb-4 rounded-xl p-4 border ${utrNumber ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                                    <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${utrNumber ? "text-green-600" : "text-amber-600"}`}>
                                        {utrNumber ? "UTR / Transaction ID (customer submitted)" : "UTR not yet submitted"}
                                    </p>
                                    {utrNumber ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-gray-900 font-bold font-mono text-lg tracking-wider">
                                                {utrNumber}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(utrNumber);
                                                    toast.info("UTR copied");
                                                }}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition text-xs font-bold"
                                            >
                                                <RiFileCopyLine /> Copy
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-amber-700 text-sm">
                                            Customer has not submitted their UTR yet. Check the order timeline for updates.
                                        </p>
                                    )}
                                    {utrSubmittedAt && (
                                        <p className="mt-1 text-[10px] text-green-600" suppressHydrationWarning>
                                            Submitted at {new Date(utrSubmittedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {/* UPI session details */}
                                {upi && (
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {[
                                            { label: "UPI ID", value: upi.upiId },
                                            { label: "Payee", value: upi.payeeName },
                                            { label: `Amount (${upi.currency})`, value: formatCurrencyAmount(upi.amount, upi.currency) },
                                            { label: "Original Amount", value: formatCurrencyAmount(upi.originalAmount, upi.originalCurrency) },
                                            { label: "Reference", value: upi.reference },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 group">
                                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">{label}</p>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-gray-900 font-semibold text-sm break-all">{value}</p>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(value);
                                                            toast.info("Copied");
                                                        }}
                                                        className="text-blue-600 opacity-0 group-hover:opacity-100 transition shrink-0"
                                                    >
                                                        <RiFileCopyLine className="text-sm" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

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
                                <label htmlFor="orderStatus" className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block mb-2 px-1">Order Status</label>
                                <select
                                    id="orderStatus"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Order["orderStatus"])}
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
                                <label htmlFor="paymentStatus" className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block mb-2 px-1">Payment Status</label>
                                <select
                                    id="paymentStatus"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value as Order["paymentStatus"])}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            {/* Admin Note */}
                            <div>
                                <label htmlFor="adminNote" className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block mb-2 px-1">Internal Note / Tracking Info</label>
                                <textarea
                                    id="adminNote"
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
