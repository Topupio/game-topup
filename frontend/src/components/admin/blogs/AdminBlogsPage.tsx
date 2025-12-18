"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { blogApiClient } from "@/services/blog/blogApi.client";
import { Blog } from "@/services/blog/types";
import BlogsToolbar from "./BlogsToolbar";
import BlogsTable from "./BlogsTable";
import SearchBox from "@/components/admin/shared/SearchBox";

interface Props {
    initialBlogs: Blog[];
}

export default function AdminBlogsPage({ initialBlogs }: Props) {
    const router = useRouter();
    const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return blogs;
        return blogs.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.category.toLowerCase().includes(q)
        );
    }, [search, blogs]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            await blogApiClient.delete(id);
            setBlogs((prev) => prev.filter((b) => b._id !== id));
            toast.success("Blog deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete blog");
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/blogs/${id}`);
    };

    return (
        <div className="p-6 w-full">
            <BlogsToolbar />
            <SearchBox value={search} onChange={setSearch} />
            <BlogsTable
                blogs={filtered}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
}
