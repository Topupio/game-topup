"use client";

import Image from "next/image";
import { TbPencil, TbTrash, TbToggleLeft, TbToggleRight } from "react-icons/tb";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { Banner } from "@/services/banner/types";

interface Props {
    items: Banner[];
    onEdit?: (index: number, item: Banner) => void;
    onDelete?: (index: number, item: Banner) => void;
    onToggle?: (index: number, item: Banner) => void;
}

export default function BannersTable({ items, onEdit, onDelete, onToggle }: Props) {
    const columns: Column<Banner>[] = [
        {
            id: "banner",
            header: "Banner",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-24 h-12 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                            src={row.imageUrl}
                            alt={row.title || "Banner"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{row.title || "Untitled"}</p>
                    </div>
                </div>
            ),
        },
        {
            id: "link",
            header: "Link",
            cell: (row) => (
                <span className="text-gray-500 text-sm truncate max-w-[200px] block">
                    {row.link || "-"}
                </span>
            ),
        },
        {
            id: "order",
            header: "Order",
            cell: (row) => (
                <span className="text-gray-700 font-medium">
                    {row.order}
                </span>
            ),
        },
        {
            id: "status",
            header: "Status",
            cell: (row, idx) => (
                <button
                    onClick={() => onToggle?.(idx, row)}
                    className="inline-flex items-center gap-1 text-green-600 disabled:opacity-60"
                    disabled={typeof onToggle !== "function"}
                    title="Toggle status"
                >
                    {row.isActive ? (
                        <>
                            <TbToggleRight size={22} /> Active
                        </>
                    ) : (
                        <span className="text-gray-500 inline-flex items-center gap-1">
                            <TbToggleLeft size={22} /> Inactive
                        </span>
                    )}
                </button>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row, idx) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => onEdit?.(idx, row)}
                        disabled={typeof onEdit !== "function"}
                    >
                        <TbPencil size={16} /> Edit
                    </button>
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition"
                        onClick={() => onDelete?.(idx, row)}
                        disabled={typeof onDelete !== "function"}
                    >
                        <TbTrash size={16} /> Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <DataTable rows={items} columns={columns} minWidth={700} />
        </div>
    );
}
