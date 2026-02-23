"use client";

import { Fragment } from "react";
import { User } from "@/services/users/types";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { TbLock, TbLockOpen, TbShieldCheck, TbUser } from "react-icons/tb";

interface Props {
    items: User[];
    onToggleStatus: (user: User) => void;
    isUpdating: string | null; // ID of user currently being updated
}

export default function UsersTable({ items, onToggleStatus, isUpdating }: Props) {
    const columns: Column<User>[] = [
        {
            id: "user",
            header: "User",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                        <span className="font-bold text-sm">
                            {row.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-foreground">{row.name}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                </div>
            ),
        },
        {
            id: "role",
            header: "Role",
            cell: (row) => (
                <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                    ${row.role === 'admin'
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-muted text-muted-foreground border-border"}
                `}>
                    {row.role === 'admin' ? <TbShieldCheck size={14} /> : <TbUser size={14} />}
                    {row.role.toUpperCase()}
                </span>
            ),
        },
        {
            id: "verified",
            header: "Verified",
            cell: (row) => (
                <div className="flex items-center">
                    {row.isVerified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                            Unverified
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: "status",
            header: "Status",
            cell: (row) => (
                <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                    ${row.status === 'active'
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"}
                `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {row?.status?.toUpperCase()}
                </span>
            ),
        },
        {
            id: "lastLogin",
            header: "Last Login",
            cell: (row) => (
                <div className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {row.lastLoginAt ? (
                        <>
                            <p>{new Date(row.lastLoginAt).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(row.lastLoginAt).toLocaleTimeString()}</p>
                        </>
                    ) : (
                        <span className="text-muted-foreground italic">Never</span>
                    )}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => onToggleStatus(row)}
                        disabled={isUpdating === row._id}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${row.status === 'active'
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                            }
                        `}
                    >
                        {isUpdating === row._id ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            row.status === 'active' ? <TbLock size={14} /> : <TbLockOpen size={14} />
                        )}
                        {row.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <DataTable rows={items} columns={columns} minWidth={800} />
        </div>
    );
}
