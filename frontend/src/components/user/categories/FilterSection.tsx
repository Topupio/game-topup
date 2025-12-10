"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gamesApiClient } from "@/services/games";
import FilterGroup from "./FilterGroup";
import PillItem from "./PillItem";
import CategoryShimmer from "./CategoryShimmer";

export default function FilterSection() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const selectedCategory = searchParams.get("category") || "";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await gamesApiClient.listCategories();
                setCategories(res.categories || []);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const updateCategory = (label: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (label === null) {
            params.delete("category");
        } else {
            params.set("category", label);
        }

        params.set("page", "1");
        router.push(`/categories?${params.toString()}`);
    };

    return (
        <div className="space-y-8 text-white">
            <FilterGroup title="Game Category">

                {/* Shimmer while loading */}
                {loading && <CategoryShimmer />}

                {/* Once loaded, show real items */}
                {!loading && (
                    <>
                        <PillItem
                            label="All"
                            selected={selectedCategory === ""}
                            onChange={() => updateCategory(null)}
                        />

                        {categories.map((label) => (
                            <PillItem
                                key={label}
                                label={label}
                                selected={selectedCategory === label}
                                onChange={() => updateCategory(label)}
                            />
                        ))}
                    </>
                )}
            </FilterGroup>
        </div>
    );
}
