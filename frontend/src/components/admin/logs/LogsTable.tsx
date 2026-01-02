"use client";

import { useState, Fragment } from "react";
import { AdminLog } from "@/services/adminLogs/types";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { TbChevronDown, TbChevronUp, TbEye } from "react-icons/tb";

interface Props {
    items: AdminLog[];
}

const ActionBadge = ({ action }: { action: string }) => {
    let colorClass = "bg-gray-100 text-gray-700";
    if (action === "CREATE") colorClass = "bg-green-100 text-green-700";
    if (action === "UPDATE") colorClass = "bg-blue-100 text-blue-700";
    if (action === "DELETE") colorClass = "bg-red-100 text-red-700";
    if (action === "LOGIN") colorClass = "bg-purple-100 text-purple-700";

    return (
        <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
        >
            {action}
        </span>
    );
};

export default function LogsTable({ items }: Props) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const columns: Column<AdminLog>[] = [
        {
            id: "admin",
            header: "Admin",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {row.admin?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{row.admin?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{row.admin?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            id: "action",
            header: "Action",
            cell: (row) => <ActionBadge action={row.action} />,
        },
        {
            id: "module",
            header: "Module",
            cell: (row) => (
                <span className="capitalize text-sm text-gray-700">{row.module}</span>
            ),
        },
        {
            id: "description",
            header: "Description",
            cell: (row) => (
                <span className="text-sm text-gray-600 truncate max-w-[200px] block" title={row.description}>
                    {row.description}
                </span>
            ),
        },
        {
            id: "date",
            header: "Date",
            cell: (row) => (
                <div className="text-xs text-gray-500">
                    <p>{new Date(row.createdAt).toLocaleDateString()}</p>
                    <p>{new Date(row.createdAt).toLocaleTimeString()}</p>
                </div>
            ),
        },
        {
            id: "expand",
            header: "",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) => (
                <button
                    onClick={() => toggleExpand(row._id)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition"
                >
                    {expandedRow === row._id ? <TbChevronUp /> : <TbChevronDown />}
                </button>
            ),
        },
    ];

    // Wrap the DataTable to inject expanded content
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.id}
                                    className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-${col.headerAlign || "left"}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 text-sm">
                                    No logs found.
                                </td>
                            </tr>
                        ) : (
                            items.map((row) => (
                                <Fragment key={row._id}>
                                    <tr className="hover:bg-gray-50 transition">
                                        {columns.map((col) => (
                                            <td
                                                key={`${row._id}-${col.id}`}
                                                className={`px-6 py-4 whitespace-nowrap text-${col.cellAlign || "left"}`}
                                            >
                                                {col.cell(row, 0)}
                                            </td>
                                        ))}
                                    </tr>
                                    {expandedRow === row._id && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan={columns.length} className="px-6 py-4">
                                                <div className="text-xs text-gray-700 space-y-2">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="font-semibold mb-1">Target ID</p>
                                                            <code className="bg-gray-100 px-2 py-1 rounded">{row.targetId || "N/A"}</code>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold mb-1">Target Model</p>
                                                            <code className="bg-gray-100 px-2 py-1 rounded">{row.targetModel || "N/A"}</code>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold mb-1">IP Address</p>
                                                            <code className="bg-gray-100 px-2 py-1 rounded">{row.ip || "N/A"}</code>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold mb-1">User Agent</p>
                                                            <span className="truncate block" title={row.userAgent}>{row.userAgent || "N/A"}</span>
                                                        </div>
                                                    </div>

                                                    {row.changes && Object.keys(row.changes).length > 0 && (
                                                        <div className="mt-4">
                                                            <p className="font-semibold mb-1">Changes</p>
                                                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto max-h-[200px]">
                                                                {JSON.stringify(row.changes, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination is handled externally in the Page component, but DataTable usually has it built-in or passed as props. 
                Since I am rebuilding a custom table structure for expandability, I am not using the shared DataTable component directly 
                if it doesn't support generic row expansion easily. 
                However, to stay consistent with the plan, I am rendering my own table here. 
            */}
        </div>
    );
}
