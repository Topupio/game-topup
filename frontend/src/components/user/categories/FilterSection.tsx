"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gamesApiClient } from "@/services/games";
import FilterGroup from "./FilterGroup";
import CategoryShimmer from "./CategoryShimmer";
import { CATEGORIES } from "@/lib/constants/checkoutTemplates";
import {
    RiGamepadFill,
    RiLoginBoxFill,
    RiSmartphoneFill,
    RiCoupon3Fill,
    RiSparklingFill,
    RiApps2Fill,
} from "react-icons/ri";

/* ── icon + color mapping per category ── */
const CATEGORY_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    "uid instant top-up": { icon: RiGamepadFill, color: "text-indigo-500", bg: "bg-indigo-50" },
    "login top-up":       { icon: RiLoginBoxFill, color: "text-amber-500", bg: "bg-amber-50" },
    "live apps top-up":   { icon: RiSmartphoneFill, color: "text-pink-500", bg: "bg-pink-50" },
    "gift cards":         { icon: RiCoupon3Fill, color: "text-emerald-500", bg: "bg-emerald-50" },
    "ai & subscriptions": { icon: RiSparklingFill, color: "text-cyan-500", bg: "bg-cyan-50" },
};


export default function FilterSection() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [apiCategories, setApiCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const selectedCategory = searchParams.get("category") || "";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await gamesApiClient.listCategories();
                setApiCategories(res.categories || []);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Always show all predefined categories, plus any extra from API
    const allCategories = [
        ...CATEGORIES,
        ...apiCategories.filter(
            (c) => !CATEGORIES.some((p) => p.toLowerCase() === c.toLowerCase())
        ),
    ];

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
        <div className="space-y-6 text-foreground p-4 lg:p-0">
            <FilterGroup title="Game Category">

                {/* Shimmer while loading */}
                {loading && <CategoryShimmer />}

                {/* Once loaded, show real items */}
                {!loading && (
                    <div className="space-y-1">
                        {/* All */}
                        <CategoryItem
                            icon={RiApps2Fill}
                            label="All"
                            iconColor="text-secondary"
                            iconBg="bg-secondary/10"
                            selected={selectedCategory === ""}
                            onClick={() => updateCategory(null)}
                        />

                        {allCategories.map((label: string) => {
                            const style = CATEGORY_STYLE[label.toLowerCase()];
                            return (
                                <CategoryItem
                                    key={label}
                                    icon={style?.icon}
                                    label={label}
                                    iconColor={style?.color || "text-muted-foreground"}
                                    iconBg={style?.bg || "bg-muted"}
                                    selected={selectedCategory === label}
                                    onClick={() => updateCategory(label)}
                                />
                            );
                        })}
                    </div>
                )}
            </FilterGroup>
        </div>
    );
}

/* ── Sidebar category item ── */
function CategoryItem({
    icon: Icon,
    label,
    iconColor,
    iconBg,
    selected,
    onClick,
}: {
    icon?: React.ElementType;
    label: string;
    iconColor: string;
    iconBg: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                transition-all duration-200
                ${selected
                    ? "bg-secondary/10 text-secondary font-semibold border border-secondary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                }
            `}
        >
            {Icon && (
                <div className={`w-8 h-8 rounded-lg ${selected ? "bg-secondary/15" : iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${selected ? "text-secondary" : iconColor}`} />
                </div>
            )}
            <span className="text-sm capitalize truncate">{label}</span>
        </button>
    );
}

