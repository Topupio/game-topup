"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@/services/banner/types";
import { bannerApiClient } from "@/services/banner";
import { toast } from 'react-toastify'
import BannersToolbar from "@/components/admin/banners/BannersToolbar";
import SearchBox from "@/components/admin/shared/SearchBox";
import BannersTable from "@/components/admin/banners/BannersTable";

interface Props {
    initialItems: Banner[];
}

export default function AdminBannerPage({ initialItems }: Props) {
    const router = useRouter();

    const [items, setItems] = useState<Banner[]>(initialItems);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return items;
        return items.filter(i =>
            (i.title || "").toLowerCase().includes(q)
        );
    }, [search, items]);

    /** EDIT */
    const handleEdit = (index: number, item: Banner) => {
        router.push(`/admin/banners/${item._id}`);
    };

    /** DELETE */
    const handleDelete = async (index: number, item: Banner) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            await bannerApiClient.delete(item._id);
            setItems(prev => prev.filter((_, i) => i !== index));
            toast.success("Banner deleted");
        } catch {
            toast.error("Failed to delete banner");
        }
    };

    /** TOGGLE STATUS */
    const handleToggle = async (index: number, item: Banner) => {
        // Optimistic update
        const newStatus = !item.isActive;
        const oldItems = [...items];

        setItems(prev =>
            prev.map((it, i) =>
                i === index ? { ...it, isActive: newStatus } : it
            )
        );

        try {
            // We need to send FormData as per our API client, even for simple updates
            // But we don't have the File object here, just updating isActive.
            // Let's create a payload just for isActive.
            await bannerApiClient.update(item._id, {
                isActive: newStatus
            });
            toast.success("Banner updated");
        } catch {
            // Revert on failure
            setItems(oldItems);
            toast.error("Failed to update banner status");
        }
    };

    return (
        <div className="p-6 w-full">
            <BannersToolbar />

            <SearchBox value={search} onChange={setSearch} />

            <BannersTable
                items={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
            />
        </div>
    );
}
