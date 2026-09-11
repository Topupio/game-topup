"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { TbLock, TbSearch, TbUserOff, TbX } from "react-icons/tb";
import DataTable, { type Column } from "@/components/admin/shared/DataTable";
import Pagination from "@/components/admin/shared/Pagination";
import { formatFixed } from "@/lib/utils/money";
import {
    walletAdminApiClient,
    type AdminWalletRow,
} from "@/services/wallet/walletAdminApi.client";
import { useDebounce } from "use-debounce";

// Maps to the `minBalancePaise` query param. "Has balance" is 1 paise, which is the
// "hide empty wallets" case phrased as something the admin is looking for.
const BALANCE_FILTERS = [
    { label: "All", value: undefined },
    { label: "Has balance", value: 1 },
    { label: "₹500+", value: 50_000 },
    { label: "₹2,000+", value: 200_000 },
];

// The endpoint caps limit at 50, but the shared Pagination offers 100. Picking 100
// would silently return 50 rows and throw off the page count.
const MAX_LIMIT = 50;

/** Relative for the first week, then a plain date — this column is scanned, not read. */
function lastActivity(iso: string): string {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return "—";

    const mins = Math.floor((Date.now() - then) / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days <= 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "2-digit",
    });
}

export default function AdminWalletsList() {
    const [rows, setRows] = useState<AdminWalletRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 400);
    const [minBalancePaise, setMinBalancePaise] = useState<number | undefined>(undefined);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchData = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            try {
                const res = await walletAdminApiClient.listWallets(
                    {
                        page,
                        limit,
                        search: debouncedSearch || undefined,
                        minBalancePaise,
                    },
                    signal
                );
                setRows(res.data.wallets);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.total);
                setFailed(false);
            } catch (error) {
                const err = error as { name?: string; code?: string };
                // An aborted request is us changing the filters, not a failure.
                if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                    setFailed(true);
                    toast.error("Could not load wallets");
                }
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [page, limit, debouncedSearch, minBalancePaise]
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    const clearFilters = () => {
        setSearch("");
        setMinBalancePaise(undefined);
        setPage(1);
    };

    const filtered = Boolean(debouncedSearch || minBalancePaise !== undefined);

    const columns: Column<AdminWalletRow>[] = [
        {
            id: "rank",
            header: "#",
            headerAlign: "right",
            cellAlign: "right",
            className: "w-12",
            // The API always sorts by balance descending and offers no sort param, so
            // the position is information the admin cannot get any other way.
            cell: (_row, index) => (
                <span className="text-xs tabular-nums text-gray-400">
                    {(page - 1) * limit + index + 1}
                </span>
            ),
        },
        {
            id: "user",
            header: "Customer",
            cell: (row) => {
                if (!row.user) {
                    return (
                        <div className="flex items-center gap-3">
                            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 md:flex">
                                <TbUserOff size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium italic text-gray-500">Deleted user</p>
                                {/* The only handle left if someone raises a ticket about this balance. */}
                                <p className="truncate font-mono text-xs text-gray-400">
                                    Wallet ···{row._id.slice(-6)}
                                </p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-3">
                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 md:flex">
                            <span className="text-sm font-bold">
                                {row.user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-medium text-gray-900">
                                {row.user.name}
                                {row.user.status && row.user.status !== "active" && (
                                    <TbLock
                                        size={12}
                                        className="shrink-0 text-gray-400"
                                        title="Customer account is blocked"
                                    />
                                )}
                            </p>
                            <p className="truncate text-xs text-gray-500">{row.user.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "balance",
            header: "Balance",
            headerAlign: "right",
            cellAlign: "right",
            className: "w-36",
            cell: (row) => {
                const empty = row.balancePaise === 0;
                return (
                    <span
                        className={`tabular-nums ${
                            empty
                                ? "font-normal text-gray-400"
                                : "text-sm font-semibold text-gray-900 md:text-base"
                        }`}
                    >
                        {formatFixed(row.balancePaise / 100, "INR")}
                    </span>
                );
            },
        },
        {
            id: "status",
            header: "Wallet",
            // Active is the overwhelming majority; a pill on every row would bury the
            // frozen ones. Blue, not red — freezing is a deliberate admin action.
            cell: (row) =>
                row.status === "frozen" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        FROZEN
                    </span>
                ) : null,
        },
        {
            id: "updated",
            header: "Last activity",
            cell: (row) => (
                <span className="text-xs text-gray-600" suppressHydrationWarning>
                    {lastActivity(row.updatedAt)}
                </span>
            ),
        },
        {
            id: "action",
            header: "",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) =>
                row.user ? (
                    <Link
                        href={`/admin/wallet/transactions?userId=${row.user._id}`}
                        aria-label={`View wallet ledger for ${row.user.name}`}
                        className="whitespace-nowrap text-xs font-medium text-secondary hover:underline"
                    >
                        Ledger →
                    </Link>
                ) : (
                    <span
                        className="cursor-not-allowed whitespace-nowrap text-xs text-gray-300"
                        title="No user record to open a ledger for"
                    >
                        Ledger →
                    </span>
                ),
        },
    ];

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-end gap-3">
                <div className="relative w-full flex-1 md:max-w-md">
                    <label className="mb-1 block text-sm text-gray-600">Search</label>
                    <TbSearch
                        size={16}
                        className="pointer-events-none absolute bottom-2.5 left-3 text-gray-400"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by name or email"
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-9 text-sm outline-none focus:border-secondary"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setPage(1);
                            }}
                            aria-label="Clear search"
                            className="absolute bottom-2.5 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <TbX size={16} />
                        </button>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm text-gray-600">Balance</label>
                    <div role="group" className="flex flex-wrap gap-2">
                        {BALANCE_FILTERS.map((option) => {
                            const active = minBalancePaise === option.value;
                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => {
                                        setMinBalancePaise(option.value);
                                        setPage(1);
                                    }}
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors md:py-1.5 ${
                                        active
                                            ? "border-secondary bg-secondary/5 text-secondary"
                                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* States the fixed sort in words, so nobody waits for a sortable header. */}
            {!loading && rows.length > 0 && (
                <p className="mb-3 text-xs text-gray-500">
                    {totalItems} wallet{totalItems === 1 ? "" : "s"} · ranked by balance, highest
                    first
                </p>
            )}

            <div className={loading ? "pointer-events-none opacity-50" : ""}>
                {failed && !loading ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <p className="text-sm font-medium text-gray-900">Could not load wallets</p>
                        <button
                            type="button"
                            onClick={() => fetchData()}
                            className="mt-3 text-sm font-medium text-secondary hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : rows.length === 0 && !loading ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        {filtered ? (
                            <>
                                <p className="text-sm font-medium text-gray-900">
                                    No wallets match
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Try a different name, or lower the balance filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-3 text-sm font-medium text-secondary hover:underline"
                                >
                                    Clear filters
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-gray-900">No wallets yet</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Wallets are created the first time a customer tops up or
                                    receives a refund.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <DataTable
                            rows={rows}
                            columns={columns}
                            minWidth={780}
                            getRowKey={(row) => row._id}
                        />

                        <div className="mt-4">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                limit={limit}
                                onPageChange={setPage}
                                onLimitChange={(value) => {
                                    setLimit(Math.min(value, MAX_LIMIT));
                                    setPage(1);
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
