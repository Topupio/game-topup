"use client";

import Link from "next/link";
import { TbPencil, TbTrash } from "react-icons/tb";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { Blog } from "@/services/blog/types";
import Image from "next/image";

interface Props {
    blogs: Blog[];
    onEdit?: (id: string, blog: Blog) => void;
    onDelete?: (id: string) => void;
}

export default function BlogsTable({ blogs, onEdit, onDelete }: Props) {
    const columns: Column<Blog>[] = [
        {
            id: "image",
            header: "Image",
            cell: (row) => (
                <div className="w-16 h-10 rounded overflow-hidden bg-gray-200 relative">
                    {row.coverImage ? (
                        <Image
                            src={row.coverImage}
                            alt={row.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            No Img
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: "title",
            header: "Title",
            cell: (row) => (
                <div>
                    <p className="font-medium text-gray-900">{row.title}</p>
                    <span className="text-xs text-gray-500">{row.slug}</span>
                </div>
            )
        },
        {
            id: "category",
            header: "Category",
            cell: (row) => (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    {row.category}
                </span>
            ),
        },
        {
            id: "createdAt",
            header: "Created At",
            cell: (row) => (
                <span className="text-sm text-gray-500" suppressHydrationWarning>
                    {new Date(row.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            headerAlign: "right",
            cellAlign: "right",
            cell: (row) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => onEdit?.(row._id, row)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border text-gray-700 hover:bg-gray-100 transition"
                    >
                        <TbPencil size={16} /> Edit
                    </button>
                    <button
                        onClick={() => onDelete?.(row._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition"
                    >
                        <TbTrash size={16} /> Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            rows={blogs}
            columns={columns}
            getRowKey={(row) => row._id}
            minWidth={800}
        />
    );
}
