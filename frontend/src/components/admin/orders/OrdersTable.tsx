"use client";

import DataTable, { Column } from "@/components/admin/shared/DataTable";

export type OrderRow = {
    id: string;
    user: string;
    game: string;
    amount: string;
    status: string;
};

type Props = {
    rows: OrderRow[];
    onView: (row: OrderRow) => void;
    onUpdate: (row: OrderRow) => void;
};

export default function OrdersTable({ rows, onView, onUpdate }: Props) {
    const columns: Column<OrderRow>[] = [
        {
            id: "orderId",
            header: "Order ID",
            cell: (r) => <span className="font-medium">#{r.id}</span>,
        },
        { id: "user", header: "User", cell: (r) => r.user },
        { id: "game", header: "Game", cell: (r) => r.game },
        { id: "amount", header: "Amount", cell: (r) => r.amount },
        {
            id: "status",
            header: "Status",
            cell: (r) => (
                <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    {r.status}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            headerAlign: "right",
            cellAlign: "right",
            cell: (r) => (
                <div className="text-right flex justify-end gap-2">
                    <button
                        onClick={() => onView(r)}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition"
                    >
                        View
                    </button>
                    <button
                        onClick={() => onUpdate(r)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200 hover:bg-red-100 transition"
                    >
                        Update
                    </button>
                </div>
            ),
        },
    ];

    return <DataTable rows={rows} columns={columns} minWidth={700} />;
}
