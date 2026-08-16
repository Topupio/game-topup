"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import DataTable, { type Column } from "@/components/admin/shared/DataTable";
import Pagination from "@/components/admin/shared/Pagination";
import FilterDropdown from "@/components/admin/shared/FilterDropdown";
import { formatFixed } from "@/lib/utils/money";
import {
    walletAdminApiClient,
    type AdminTopup,
} from "@/services/wallet/walletAdminApi.client";
import TopupDecisionModal from "./TopupDecisionModal";

const STATUS_OPTIONS = [
    { label: "Awaiting review", value: "paid" },
    { label: "Pending payment", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Rejected", value: "rejected" },
    { label: "Expired", value: "expired" },
    { label: "All", value: "" },
];

const METHOD_OPTIONS = [
    { label: "All methods", value: "" },
    { label: "UPI", value: "upi" },
    { label: "Crypto", value: "usdt" },
];

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-blue-50 text-blue-700 border-blue-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    expired: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function AdminTopupQueue() {
    const [topups, setTopups] = useState<AdminTopup[]>([]);
    const [loading, setLoading] = useState(true);

    // Defaults to the queue that needs attention: customer says paid, awaiting checking.
    const [status, setStatus] = useState("paid");
    const [method, setMethod] = useState("");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [selected, setSelected] = useState<AdminTopup | null>(null);
    const [decision, setDecision] = useState<"approve" | "reject">("approve");

    const fetchData = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            try {
                const res = await walletAdminApiClient.listTopups(
                    { page, limit, status: status || undefined, method: method || undefined },
                    signal
                );
                setTopups(res.data.topups);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.total);
            } catch (error) {
                const err = error as { name?: string; code?: string };
                if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                    toast.error("Could not load top-ups");
                }
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [page, limit, status, method]
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    const handleDecision = async (note: string) => {
        if (!selected) return;

        try {
            if (decision === "approve") {
                const res = await walletAdminApiClient.approveTopup(selected._id, note);
                if (res.success) toast.success("Top-up approved and wallet credited");
            } else {
                const res = await walletAdminApiClient.rejectTopup(selected._id, note);
                if (res.success) toast.success("Top-up rejected");
            }
            setSelected(null);
            fetchData();
        } catch (error) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Could not complete that action";
            toast.error(message);
        }
    };

    const columns: Column<AdminTopup>[] = [
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
            id: "amount",
            header: "Amount",
            cellAlign: "right",
            headerAlign: "right",
            cell: (row) => (
                <span className="font-semibold text-gray-900">
                    {formatFixed(row.amountPaise / 100, "INR")}
                </span>
            ),
        },
        {
            id: "method",
            header: "Method",
            cell: (row) => <span className="uppercase text-xs">{row.method}</span>,
        },
        {
            id: "utr",
            header: "UTR / Reference",
            cell: (row) => (
                <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-gray-900">
                        {row.upi?.utrNumber || row.providerRef || "—"}
                    </p>
                    <p className="truncate text-xs text-gray-400">{row.topupRef}</p>
                </div>
            ),
        },
        {
            id: "submitted",
            header: "Submitted",
            cell: (row) => {
                const at = row.upi?.utrSubmittedAt || row.createdAt;
                return (
                    <span className="text-xs text-gray-600">
                        {new Date(at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                        })}
                    </span>
                );
            },
        },
        {
            id: "status",
            header: "Status",
            cell: (row) => (
                <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[row.status] || STATUS_STYLES.expired
                    }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) => {
                // Only a top-up that has not been settled either way can be acted on.
                const actionable = row.status === "paid" || row.status === "pending";

                if (!actionable) {
                    return <span className="text-xs text-gray-400">—</span>;
                }

                return (
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setSelected(row);
                                setDecision("approve");
                            }}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => {
                                setSelected(row);
                                setDecision("reject");
                            }}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                            Reject
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <FilterDropdown
                    label="Status"
                    value={status}
                    options={STATUS_OPTIONS}
                    onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                />
                <FilterDropdown
                    label="Method"
                    value={method}
                    options={METHOD_OPTIONS}
                    onChange={(value) => {
                        setMethod(value);
                        setPage(1);
                    }}
                />
            </div>

            <div className={loading ? "pointer-events-none opacity-50" : ""}>
                {topups.length === 0 && !loading ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <p className="text-sm font-medium text-gray-900">Nothing to review</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Top-ups awaiting verification will appear here.
                        </p>
                    </div>
                ) : (
                    <DataTable
                        rows={topups}
                        columns={columns}
                        getRowKey={(row) => row._id}
                        minWidth={900}
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

            <TopupDecisionModal
                topup={selected}
                decision={decision}
                onClose={() => setSelected(null)}
                onConfirm={handleDecision}
            />
        </div>
    );
}
