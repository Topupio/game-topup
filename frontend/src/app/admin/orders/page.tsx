"use client";

import { useState } from "react";
import StatusFilter from "@/components/admin/orders/StatusFilter";
import SearchBox from "@/components/admin/shared/SearchBox";
import OrdersTable, { type OrderRow } from "@/components/admin/orders/OrdersTable";
import OrderViewDrawer from "@/components/admin/orders/OrderViewDrawer";
import OrderUpdateModal from "@/components/admin/orders/OrderUpdateModal";

export default function OrdersPage() {
    const [status, setStatus] = useState("all");
    const [query, setQuery] = useState("");
    const [viewData, setViewData] = useState<OrderRow | null>(null);
    const [updateData, setUpdateData] = useState<OrderRow | null>(null);

    return (
        <div className="p-6 w-full">
            <h1 className="text-2xl font-semibold mb-6">Orders</h1>

            {/* Filters + Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <StatusFilter value={status} onChange={setStatus} />
                <SearchBox value={query} onChange={setQuery} />
            </div>

            {/* Orders Table */}
            <OrdersTable
                rows={[1, 2, 3, 4, 5, 6].map((n) => ({
                    id: `1020${n}`,
                    user: "John Doe",
                    game: "Efootball 24 Coins",
                    amount: "₹499",
                    status: "Pending",
                }))}
                onView={(row) => setViewData(row)}
                onUpdate={(row) => setUpdateData(row)}
            />

            {/* VIEW DRAWER */}
            <OrderViewDrawer
                open={!!viewData}
                onClose={() => setViewData(null)}
                data={viewData ? { id: viewData.id, user: viewData.user, game: viewData.game, amount: viewData.amount } : null}
            />

            {/* UPDATE MODAL */}
            <OrderUpdateModal
                open={!!updateData}
                onClose={() => setUpdateData(null)}
                currentStatus={updateData?.status}
                onSave={() => {
                    // placeholder: update order status API
                    setUpdateData(null);
                }}
            />
        </div>
    );
}
