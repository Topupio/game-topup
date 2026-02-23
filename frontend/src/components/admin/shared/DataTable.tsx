"use client";

import React from "react";

export type Column<T> = {
    id: string;
    header: string;
    className?: string;
    cell: (row: T, index: number) => React.ReactNode;
    headerAlign?: "left" | "right" | "center";
    cellAlign?: "left" | "right" | "center";
};

export type DataTableProps<T> = {
    rows: T[];
    columns: Column<T>[];
    getRowKey?: (row: T, index: number) => string | number;
    minWidth?: number;
    className?: string;
};

export default function DataTable<T>({ rows, columns, getRowKey, minWidth = 700, className = "" }: DataTableProps<T>) {
    return (
        <div className={`bg-card rounded-xl shadow-sm border border-border overflow-x-auto ${className}`}>
            <table className="w-full border-collapse" style={{ minWidth }}>
                <thead className="bg-muted text-left text-xs md:text-sm text-muted-foreground">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.id}
                                className={`px-2 py-2 md:p-4 ${col.className || ""} ${col.headerAlign === "right" ? "text-right" : col.headerAlign === "center" ? "text-center" : ""
                                    }`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-xs md:text-sm">
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="p-4 text-center text-muted-foreground border-t border-border"
                            >
                                No items available
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, idx) => (
                            <tr
                                key={getRowKey ? getRowKey(row, idx) : idx}
                                className="border-t border-border hover:bg-muted transition"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.id}
                                        className={`px-2 py-2 md:p-4 ${col.cellAlign === "right"
                                                ? "text-right"
                                                : col.cellAlign === "center"
                                                    ? "text-center"
                                                    : ""
                                            } ${col.className || ""}`}
                                    >
                                        {col.cell(row, idx)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
