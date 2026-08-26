"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Game, GamesListResponse, CheckoutTemplateDoc } from "@/lib/types/game";
import { gamesApiClient } from "@/services/games";
import { checkoutTemplatesApiClient } from "@/services/checkoutTemplates/checkoutTemplatesApi.client";
import { toast } from 'react-toastify'
import { FiAlertTriangle, FiLoader, FiSlash } from "react-icons/fi";
import GamesToolbar from "@/components/admin/games/GamesToolbar";
import SearchBox from "@/components/admin/shared/SearchBox";
import FilterDropdown from "@/components/admin/shared/FilterDropdown";
import GamesTable from "@/components/admin/games/GamesTable";
import Pagination from "@/components/admin/shared/Pagination";

// "login_topup" is the current key; "genshin_login" is the legacy value some
// games are still on. Filtering/disabling one must cover both.
const LOGIN_TEMPLATE_ALIASES: Record<string, string[]> = {
    login_topup: ["login_topup", "genshin_login"],
};

/** Expand a selected template key into every key it should match. */
const expandTemplate = (key: string) =>
    (LOGIN_TEMPLATE_ALIASES[key] ?? [key]).join(",");

const AdminGamePage = ({ initialData }: { initialData: GamesListResponse }) => {
    const router = useRouter();

    const [items, setItems] = useState<Game[]>(initialData.data);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 900);
    const [template, setTemplate] = useState("");

    const [page, setPage] = useState(initialData.page);
    const [limit, setLimit] = useState(initialData.limit);
    const [totalPages, setTotalPages] = useState(initialData.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.total);
    const [loading, setLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    /** TEMPLATE OPTIONS — DB-backed, so custom templates show up too */
    const [templates, setTemplates] = useState<CheckoutTemplateDoc[]>([]);

    useEffect(() => {
        checkoutTemplatesApiClient
            .getAll()
            .then((res) => setTemplates(res.data))
            .catch(() => { });
    }, []);

    const templateOptions = useMemo(
        () => templates.map((t) => ({ value: t.key, label: t.label })),
        [templates]
    );

    const templateLabel = useMemo(
        () => templates.find((t) => t.key === template)?.label ?? template,
        [templates, template]
    );

    /** FETCH DATA */
    const fetchData = useCallback(async (p: number, l: number, s: string, t: string) => {
        setLoading(true);
        try {
            const res = await gamesApiClient.list({
                page: p,
                limit: l,
                search: s,
                // Admin lists disabled games too; the storefront default excludes them.
                includeInactive: true,
                ...(t ? { checkoutTemplate: expandTemplate(t) } : {})
            });
            setItems(res.data);
            setTotalPages(res.totalPages);
            setTotalItems(res.total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch games");
        } finally {
            setLoading(false);
        }
    }, []);

    const isInitialMount = useRef(true);

    // Only fetch on search/page/limit/template changes — skip first mount
    // (server already fetched initialData)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        fetchData(page, limit, debouncedSearch, template);
    }, [page, limit, debouncedSearch, template, fetchData]);

    /** EDIT */
    const handleEdit = (index: number, item: Game) => {
        router.push(`/admin/games/${item.slug}`);
    };

    /** DELETE */
    const handleDelete = async (index: number, item: Game) => {
        if (!confirm("Are you sure you want to delete this game?")) return;

        try {
            await gamesApiClient.remove(item._id);
            setItems(prev => prev.filter(i => i._id !== item._id));
            setTotalItems(prev => prev - 1);
            toast.success("Game deleted");
        } catch {
            toast.error("Failed to delete game");
        }
    };

    /** TOGGLE STATUS */
    const handleToggle = async (index: number, item: Game) => {
        const newStatus = item.status === "active" ? "inactive" : "active";

        try {
            // Assuming there's a patch/update endpoint for status
            await gamesApiClient.update(item.slug, { status: newStatus } as any);

            setItems(prev =>
                prev.map(it =>
                    it._id === item._id ? { ...it, status: newStatus } : it
                )
            );
            
            toast.success(`Game status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    /** BULK DISABLE — applies to every game on the selected template, not just
     *  this page. Hidden while a search is active, since the search narrows the
     *  visible rows but not the bulk action. */
    const canBulkDisable = !!template && !debouncedSearch && totalItems > 0;

    const handleBulkDisable = async () => {
        if (!template) return;

        const ok = confirm(
            `Set all ${totalItems} "${templateLabel}" game(s) to inactive?\n\n` +
            `This applies to every game on this template, not only the ones on this page.`
        );
        if (!ok) return;

        setBulkLoading(true);
        try {
            const res = await gamesApiClient.bulkStatus({
                status: "inactive",
                checkoutTemplate: expandTemplate(template),
            });
            toast.success(`${res.modified} game(s) disabled`);
            await fetchData(page, limit, debouncedSearch, template);
        } catch (error) {
            console.error(error);
            toast.error("Failed to disable games");
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <div className="p-2 md:p-6 w-full space-y-4">
            <GamesToolbar />

            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
                {/* Label wraps the control (rather than using htmlFor) because
                    SearchBox does not expose an id prop to target. */}
                <label className="w-full md:w-80">
                    <span className="mb-1 block text-sm font-medium text-gray-700">
                        Search
                    </span>
                    <SearchBox
                        value={search}
                        onChange={(val) => {
                            setSearch(val);
                            setPage(1); // Reset to page 1 on search
                        }}
                        placeholder="Search games..."
                        className="w-full"
                    />
                </label>

                <FilterDropdown
                    label="Template"
                    value={template}
                    options={templateOptions}
                    onChange={(value) => {
                        setTemplate(value);
                        setPage(1);
                    }}
                    className="w-full md:w-64"
                />
            </div>

            {canBulkDisable && (
                <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/60 p-3 md:flex-row md:items-center md:justify-between md:gap-4 md:p-4">
                    <div className="flex items-start gap-3">
                        <FiAlertTriangle
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-base text-red-600"
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 md:text-sm">
                                {totalItems} game{totalItems === 1 ? "" : "s"} on the{" "}
                                <span className="font-bold">{templateLabel}</span> template
                            </p>
                            <p className="mt-0.5 text-xs text-gray-600">
                                Disabling affects all matching games across every page — not just
                                the rows shown below.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleBulkDisable}
                        disabled={bulkLoading}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:text-sm"
                    >
                        {bulkLoading ? (
                            <>
                                <FiLoader aria-hidden="true" className="animate-spin" />
                                Disabling…
                            </>
                        ) : (
                            <>
                                <FiSlash aria-hidden="true" />
                                Disable all {totalItems}
                            </>
                        )}
                    </button>
                </div>
            )}

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <GamesTable
                    items={items}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(l) => {
                        setLimit(l);
                        setPage(1);
                    }}
                />
            </div>
        </div>
    )
}

export default AdminGamePage;
