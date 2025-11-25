"use client";

import Image from "next/image";
import { TbPencil, TbTrash, TbToggleLeft, TbToggleRight } from "react-icons/tb";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { Game } from "@/lib/types/game";

interface Props {
    items: Game[];
    onEdit?: (index: number, item: Game) => void;
    onDelete?: (index: number, item: Game) => void;
    onToggle?: (index: number, item: Game) => void;
}

export default function GamesTable({ items, onEdit, onDelete, onToggle }: Props) {
    const columns: Column<Game>[] = [
        {
            id: "game",
            header: "Game",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    {row.imageUrl ? (
                        <Image
                            src={row.imageUrl}
                            alt={row.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md" />
                    )}

                    <div>
                        <p className="font-medium">{row.name}</p>
                        <span className="text-xs text-gray-500">{row.slug}</span>
                    </div>
                </div>
            ),
        },
        {
            id: "required",
            header: "Required Fields",
            cell: (row) => (
                <span className="text-gray-700">
                    {row.requiredFields?.length || 0} fields
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
                    {row.status === "active" ? (
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
