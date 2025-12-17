"use client";

import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";

export default function BlogsToolbar() {
    return (
        <AdminToolbar
            title="Manage Blogs"
            actions={
                <Link
                    href="/admin/blogs/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition"
                >
                    <FiPlus size={18} /> Add Blog
                </Link>
            }
        />
    );
}
