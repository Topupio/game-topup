"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import { blogApiClient } from "@/services/blog/blogApi.client";
import { Blog, BlogListResponse } from "@/services/blog/types";
import BlogsToolbar from "./BlogsToolbar";
import BlogsTable from "./BlogsTable";
import SearchBox from "@/components/admin/shared/SearchBox";
import Pagination from "../shared/Pagination";

interface Props {
    initialData: BlogListResponse;
}

export default function AdminBlogsPage({ initialData }: Props) {
    const router = useRouter();
    const [blogs, setBlogs] = useState<Blog[]>(initialData.data);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 900);

    const [page, setPage] = useState(initialData.page);
    const [limit, setLimit] = useState(initialData.limit);
    const [totalPages, setTotalPages] = useState(initialData.totalPages);
    const [totalItems, setTotalItems] = useState(initialData.total);
    const [loading, setLoading] = useState(false);

    /** FETCH DATA */
    const fetchData = useCallback(async (p: number, l: number, s: string) => {
        setLoading(true);
        try {
            const res = await blogApiClient.list({
                page: p,
                limit: l,
                search: s
            } as any);
            setBlogs(res.data);
            setTotalPages(res.totalPages);
            setTotalItems(res.total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(page, limit, debouncedSearch);
    }, [page, limit, debouncedSearch, fetchData]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            await blogApiClient.delete(id);
            setBlogs((prev) => prev.filter((b) => b._id !== id));
            setTotalItems(prev => prev - 1);
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
        <div className="p-2 md:p-6 w-full space-y-4">
            <BlogsToolbar />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="w-full md:max-w-md">
                    <SearchBox
                        value={search}
                        onChange={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <BlogsTable
                    blogs={blogs}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(l) => {
                        setLimit(l);
                        setPage(1);
                    }}
                />
            </div>
        </div>
    );
}

