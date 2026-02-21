"use client";

import Link from "next/link";
import { RiEyeLine } from "react-icons/ri";
import { Order } from "@/services/orders/types";
import DataTable, { Column } from "@/components/admin/shared/DataTable";

interface Props {
    items: Order[];
}

export default function OrdersTable({ items }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "text-green-600 bg-green-50";
            case "processing": return "text-blue-600 bg-blue-50";
            case "cancelled":
            case "failed": return "text-red-600 bg-red-50";
            case "paid": return "text-purple-600 bg-purple-50";
            default: return "text-yellow-600 bg-yellow-50";
        }
    };

    const columns: Column<Order>[] = [
        {
            id: "orderId",
            header: "Order ID",
            cell: (row) => (
                <span className="font-mono font-bold text-blue-600">#{row.orderId}</span>
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
        {
            id: "status",
            header: "Status",
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
        <DataTable rows={items} columns={columns} />
    );
}
