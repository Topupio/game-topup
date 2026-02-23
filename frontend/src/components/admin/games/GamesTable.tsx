"use client";

import Image from "next/image";
import { TbPencil, TbTrash, TbToggleLeft, TbToggleRight } from "react-icons/tb";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { Game } from "@/lib/types/game";
import { CHECKOUT_TEMPLATES } from "@/lib/constants/checkoutTemplates";
import { getRegionByKey } from "@/lib/constants/regions";

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
                        <div className="w-10 h-10 bg-muted rounded-md" />
                    )}

                    <div>
                        <p className="font-medium">{row.name}</p>
                        <span className="text-xs text-muted-foreground">{row.slug}</span>
                    </div>
                </div>
            ),
        },
        {
            id: "variants",
            header: "Variants",
            cell: (row) => (
                <span className="text-foreground">
                    {row.variants?.length || 0} variant{(row.variants?.length || 0) !== 1 ? "s" : ""}
                </span>
            ),
        },
        {
            id: "regions",
            header: "Regions",
            cell: (row) => (
                <div className="flex flex-wrap gap-1">
                    {(row.regions || []).map((r) => {
                        const region = getRegionByKey(r);
                        return (
                            <span
                                key={r}
                                className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
                            >
                                {region?.label || r}
                            </span>
                        );
                    })}
                </div>
            ),
        },
        {
            id: "template",
            header: "Template",
            cell: (row) => {
                const unique = [...new Set(
                    (row.variants || [])
                        .map((v) => v.checkoutTemplate)
                        .filter(Boolean)
                )];
                if (unique.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {unique.map((key) => {
                            const tmpl = CHECKOUT_TEMPLATES[key];
                            return (
                                <span key={key} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                    {tmpl?.label || key}
                                </span>
                            );
                        })}
                    </div>
                );
            },
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
                        <span className="text-muted-foreground inline-flex items-center gap-1">
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
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border text-foreground hover:bg-muted transition"
                        onClick={() => onEdit?.(idx, row)}
                        disabled={typeof onEdit !== "function"}
                    >
                        <TbPencil size={16} /> Edit
                    </button>
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-500/10 transition"
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
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <DataTable rows={items} columns={columns} minWidth={800} />
        </div>
    );
}
