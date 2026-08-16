"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import DataTable, { type Column } from "@/components/admin/shared/DataTable";
import Pagination from "@/components/admin/shared/Pagination";
import FilterDropdown from "@/components/admin/shared/FilterDropdown";
import { formatFixed } from "@/lib/utils/money";
import {
    walletAdminApiClient,
    type AdminTransaction,
} from "@/services/wallet/walletAdminApi.client";

const TYPE_OPTIONS = [
    { label: "All types", value: "" },
    { label: "Top-up", value: "credit_topup" },
    { label: "Refund", value: "credit_refund" },
    { label: "Manual credit", value: "credit_manual" },
    { label: "Promo credit", value: "credit_promo" },
    { label: "Referral credit", value: "credit_referral" },
    { label: "Order payment", value: "debit_order" },
    { label: "Manual debit", value: "debit_manual" },
];

const SOURCE_OPTIONS = [
    { label: "All entries", value: "" },
    { label: "Admin-initiated only", value: "true" },
];

const TYPE_LABELS: Record<string, string> = {
    credit_topup: "Top-up",
    credit_refund: "Refund",
    credit_manual: "Manual credit",
    credit_promo: "Promo credit",
    credit_referral: "Referral",
    debit_order: "Order payment",
    debit_manual: "Manual debit",
};

export default function AdminWalletTransactions() {
    const [rows, setRows] = useState<AdminTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [type, setType] = useState("");
    const [adminOnly, setAdminOnly] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchData = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            try {
                const res = await walletAdminApiClient.listTransactions(
                    {
                        page,
                        limit,
                        type: type || undefined,
                        adminOnly: adminOnly || undefined,
                        from: from || undefined,
                        to: to || undefined,
                    },
                    signal
                );
                setRows(res.data.transactions);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.total);
            } catch (error) {
                const err = error as { name?: string; code?: string };
                if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                    toast.error("Could not load transactions");
                }
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [page, limit, type, adminOnly, from, to]
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    const columns: Column<AdminTransaction>[] = [
        {
            id: "when",
            header: "Date",
            cell: (row) => (
                <span className="text-xs text-gray-600">
                    {new Date(row.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                        hour: "numeric",
                        minute: "2-digit",
                    })}
                </span>
            ),
        },
        {
            id: "user",
            header: "Customer",
            cell: (row) => (
                <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{row.user?.name || "Unknown"}</p>
                    <p className="truncate text-xs text-gray-500">{row.user?.email}</p>
                </div>
            ),
        },
        {
            id: "type",
            header: "Type",
            cell: (row) => <span className="text-xs">{TYPE_LABELS[row.type] || row.type}</span>,
        },
        {
            id: "amount",
            header: "Amount",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) => {
                const credit = row.deltaPaise > 0;
                return (
                    <span className={`font-semibold ${credit ? "text-green-600" : "text-gray-900"}`}>
                        {credit ? "+" : "−"}
                        {formatFixed(row.amountPaise / 100, "INR")}
                    </span>
                );
            },
        },
        {
            id: "balance",
            header: "Balance after",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) => (
                <span className="text-xs text-gray-600">
                    {formatFixed(row.balanceAfterPaise / 100, "INR")}
                </span>
            ),
        },
        {
            id: "context",
            header: "Reference",
            cell: (row) => (
                <div className="min-w-0 text-xs">
                    {row.order?.orderId && (
                        <Link
                            href={`/admin/orders/${row.order._id}`}
                            className="block truncate font-medium text-blue-600 hover:underline"
                        >
                            {row.order.orderId}
                        </Link>
                    )}
                    {/* Present on every admin-initiated row — the ledger enforces it. */}
                    {row.reason && <p className="truncate text-gray-600">{row.reason}</p>}
                    {row.admin?.name && (
                        <p className="truncate text-gray-400">by {row.admin.name}</p>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-end gap-3">
                <FilterDropdown
                    label="Type"
                    value={type}
                    options={TYPE_OPTIONS}
                    className="w-full md:w-56"
                    onChange={(value) => {
                        setType(value);
                        setPage(1);
                    }}
                />

                <FilterDropdown
                    label="Source"
                    value={adminOnly}
                    options={SOURCE_OPTIONS}
                    className="w-full md:w-56"
                    onChange={(value) => {
                        setAdminOnly(value);
                        setPage(1);
                    }}
                />

                <div>
                    <label className="mb-1 block text-sm text-gray-600">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => {
                            setFrom(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-secondary"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm text-gray-600">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => {
                            setTo(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-secondary"
                    />
                </div>
            </div>

            <div className={loading ? "pointer-events-none opacity-50" : ""}>
                {rows.length === 0 && !loading ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <p className="text-sm font-medium text-gray-900">No transactions found</p>
                        <p className="mt-1 text-xs text-gray-500">Try widening the filters.</p>
                    </div>
                ) : (
                    <DataTable
                        rows={rows}
                        columns={columns}
                        getRowKey={(row) => row._id}
                        minWidth={950}
                    />
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        limit={limit}
                        onPageChange={setPage}
                        onLimitChange={(value) => {
                            setLimit(value);
                            setPage(1);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
