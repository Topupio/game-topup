"use client";

import Link from "next/link";
import {
    RiArchiveLine,
    RiCheckboxCircleLine,
    RiCloseCircleLine,
    RiErrorWarningLine,
    RiEyeLine,
    RiLoader4Line,
    RiMoneyRupeeCircleLine,
    RiQrCodeLine,
    RiTimeLine,
    RiTimerFlashLine,
} from "react-icons/ri";
import { IconType } from "react-icons";
import { AdminOrderQueue, Order, PaymentStatus } from "@/services/orders/types";
import DataTable, { Column } from "@/components/admin/shared/DataTable";

interface Props {
    items: Order[];
    activeQueue: AdminOrderQueue;
    onQueueChange: (queue: AdminOrderQueue) => void;
}

type StatusTab = {
    value: AdminOrderQueue;
    label: string;
    icon: IconType;
};

const STATUS_TABS: StatusTab[] = [
    { value: "completed", label: "Completed", icon: RiCheckboxCircleLine },
    { value: "paid", label: "Paid", icon: RiMoneyRupeeCircleLine },
    { value: "upi_review", label: "UPI Review", icon: RiQrCodeLine },
    { value: "processing", label: "Processing", icon: RiLoader4Line },
    { value: "pending", label: "Pending", icon: RiTimeLine },
    { value: "failed", label: "Failed", icon: RiErrorWarningLine },
    { value: "cancelled", label: "Cancelled", icon: RiCloseCircleLine },
    { value: "expired", label: "Expired", icon: RiTimerFlashLine },
    { value: "", label: "All", icon: RiArchiveLine },
];

export default function OrdersTable({ items, activeQueue, onQueueChange }: Props) {
    const isUpiReview = activeQueue === "upi_review";

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "text-green-700 bg-green-50 border-green-200";
            case "processing": return "text-blue-700 bg-blue-50 border-blue-200";
            case "expired": return "text-gray-700 bg-gray-50 border-gray-200";
            case "cancelled":
            case "failed": return "text-red-700 bg-red-50 border-red-200";
            case "paid": return "text-emerald-700 bg-emerald-50 border-emerald-200";
            default: return "text-amber-700 bg-amber-50 border-amber-200";
        }
    };

    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case "paid": return "text-emerald-700 bg-emerald-50 border-emerald-200";
            case "failed": return "text-red-700 bg-red-50 border-red-200";
            case "refunded": return "text-gray-700 bg-gray-50 border-gray-200";
            default: return "text-amber-700 bg-amber-50 border-amber-200";
        }
    };

    const getUtrStatusColor = (hasUtr: boolean) => (
        hasUtr
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : "text-amber-700 bg-amber-50 border-amber-200"
    );

    const formatSubmittedAt = (submittedAt?: string) => {
        if (!submittedAt) return "-";
        return new Date(submittedAt).toLocaleString();
    };

    const columns: Column<Order>[] = [
        {
            id: "orderId",
            header: "Order ID",
            cell: (row) => (
                <Link href={`/admin/orders/${row._id}`} className="font-mono font-bold text-blue-600 hover:text-blue-800">
                    #{row.orderId}
                </Link>
            ),
        },
        {
            id: "customer",
            header: "Customer",
            cell: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.user?.name || "Deleted User"}</div>
                    <div className="text-gray-500 text-xs">{row.user?.email || "No email"}</div>
                </div>
            ),
        },
        {
            id: "product",
            header: "Product",
            cell: (row) => (
                <div>
                    <div className="text-gray-900">{row.productSnapshot.name}</div>
                    <div className="text-gray-500 text-xs">{row.game?.name || "Deleted Game"}</div>
                </div>
            ),
        },
        {
            id: "amount",
            header: "Amount",
            cell: (row) => (
                <span className="font-bold text-gray-900">₹{row.amount}</span>
            ),
        },
        ...(isUpiReview ? [
            {
                id: "utrStatus",
                header: "UTR Status",
                cell: (row) => {
                    const hasUtr = Boolean(row.paymentInfo?.utrNumber);

                    return (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getUtrStatusColor(hasUtr)}`}>
                            {hasUtr ? "SUBMITTED" : "NOT SUBMITTED"}
                        </span>
                    );
                },
            },
            {
                id: "utrNumber",
                header: "UTR Number",
                cell: (row) => (
                    <span className="font-mono text-gray-900">
                        {row.paymentInfo?.utrNumber || "-"}
                    </span>
                ),
            },
            {
                id: "submittedAt",
                header: "Submitted At",
                cell: (row) => (
                    <span className="text-gray-500" suppressHydrationWarning>
                        {formatSubmittedAt(row.paymentInfo?.utrSubmittedAt)}
                    </span>
                ),
            },
        ] satisfies Column<Order>[] : [
            {
                id: "payment",
                header: "Payment",
                cell: (row) => (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentStatusColor(row.paymentStatus)}`}>
                        {row.paymentStatus.toUpperCase()}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Order",
                cell: (row) => (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(row.orderStatus)}`}>
                        {row.orderStatus.toUpperCase()}
                    </span>
                ),
            },
            {
                id: "date",
                header: "Date",
                cell: (row) => (
                    <span className="text-gray-500" suppressHydrationWarning>
                        {new Date(row.createdAt).toLocaleDateString()}
                    </span>
                ),
            },
        ] satisfies Column<Order>[]),
        {
            id: "actions",
            header: "Actions",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) => (
                <Link
                    href={`/admin/orders/${row._id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                >
                    <RiEyeLine /> Review
                </Link>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm">
                <div className="flex gap-1 overflow-x-auto p-2">
                    {STATUS_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeQueue === tab.value;

                        return (
                            <button
                                key={tab.label}
                                type="button"
                                onClick={() => onQueueChange(tab.value)}
                                className={`shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive
                                    ? "bg-gray-900 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                aria-pressed={isActive}
                            >
                                <Icon className={isActive ? "text-white" : "text-gray-500"} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <DataTable rows={items} columns={columns} getRowKey={(row) => row._id} minWidth={860} />
        </div>
    );
}
