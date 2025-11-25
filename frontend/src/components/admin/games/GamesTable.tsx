"use client";

import { TbPencil, TbTrash, TbToggleLeft, TbToggleRight } from "react-icons/tb";
import DataTable, { Column } from "@/components/admin/shared/DataTable";

export type GameRow = {
    game: string;
    denom: string;
    price: string;
    active: boolean;
};

interface Props {
    items: GameRow[];
    onEdit?: (index: number, item: GameRow) => void;
    onDelete?: (index: number, item: GameRow) => void;
    onToggle?: (index: number, item: GameRow) => void;
}

export default function GamesTable({ items, onEdit, onDelete, onToggle }: Props) {
    const columns: Column<GameRow>[] = [
        {
            id: "game",
            header: "Game",
            cell: (row) => <span className="font-medium">{row.game}</span>,
        },
        {
            id: "denom",
            header: "Denomination",
            cell: (row) => row.denom,
        },
        {
            id: "price",
            header: "Price",
            cell: (row) => row.price,
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
                    {row.active ? (
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
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition"
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
