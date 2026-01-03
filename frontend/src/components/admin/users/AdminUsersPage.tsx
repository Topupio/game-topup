"use client";

import { useState, useCallback, useEffect } from "react";
import { User, UserResponse } from "@/services/users/types";
import { usersApiClient } from "@/services/users/usersApi.client";
import { toast } from "react-toastify";
import UsersToolbar from "./UsersToolbar";
import UsersTable from "./UsersTable";
import Pagination from "@/components/admin/shared/Pagination";

export default function AdminUsersPage({ initialData }: { initialData: UserResponse }) {
    const [items, setItems] = useState<User[]>(initialData.data.users);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Filter State
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");

    // Pagination State
    const [page, setPage] = useState(initialData.data.pagination.page);
    const [limit, setLimit] = useState(initialData.data.pagination.limit);
    const [totalPages, setTotalPages] = useState(initialData.data.pagination.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.data.pagination.total);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await usersApiClient.list({
                page,
                limit,
                search,
                role: role || undefined,
                status: status || undefined,
            });
            setItems(res.data.users);
            setTotalPages(res.data.pagination.totalPages);
            setTotalItems(res.data.pagination.total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, role, status]);

    // Trigger fetch when dependencies change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = useCallback((newFilters: any) => {
        setSearch(newFilters.search || "");
        setRole(newFilters.role || "");
        setStatus(newFilters.status || "");
        setPage(1); // Reset to page 1
    }, []);

    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === "active" ? "blocked" : "active";

        if (!confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK'} ${user.name}?`)) {
            return;
        }

        setUpdatingId(user._id);
        try {
            await usersApiClient.updateStatus(user._id, newStatus);

            // Optimistic Update
            setItems(prev => prev.map(u =>
                u._id === user._id ? { ...u, status: newStatus } : u
            ));

            toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <UsersToolbar onFilterChange={handleFilterChange} />

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <UsersTable
                    items={items}
                    onToggleStatus={handleToggleStatus}
                    isUpdating={updatingId}
                />

                <div className="mt-4">
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
        </div>
    );
}
