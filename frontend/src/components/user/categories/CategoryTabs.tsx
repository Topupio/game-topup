"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    RiGamepadFill,
    RiLoginBoxFill,
    RiSmartphoneFill,
    RiCoupon3Fill,
    RiSparklingFill,
    RiApps2Fill,
} from "react-icons/ri";
import { CATEGORIES, categoryToSlug, slugToCategory } from "@/lib/constants/checkoutTemplates";

/* ── short labels + icons ── */
const TAB_META: Record<string, { icon: React.ElementType; label: string }> = {
    "uid instant top-up": { icon: RiGamepadFill, label: "Top Up" },
    "login top-up":       { icon: RiLoginBoxFill, label: "Game Coins" },
    "live apps top-up":   { icon: RiSmartphoneFill, label: "Live Apps" },
    "gift cards":         { icon: RiCoupon3Fill, label: "Gift Cards" },
    "ai & subscriptions": { icon: RiSparklingFill, label: "Subscriptions" },
};

export default function CategoryTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedSlug = searchParams.get("category") || "";
    const selectedCategory = selectedSlug ? slugToCategory(selectedSlug) : "";

    const navigate = (cat: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (cat === null) {
            params.delete("category");
        } else {
            params.set("category", categoryToSlug(cat));
        }
        params.set("page", "1");
        router.push(`/categories?${params.toString()}`);
    };

    const isAll = selectedCategory === "";

    return (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            {/* All tab */}
            <button
                onClick={() => navigate(null)}
                className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold
                    border whitespace-nowrap transition-all duration-200
                    ${isAll
                        ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/20"
                        : "bg-white text-gray-600 border-gray-200 hover:border-secondary/40 hover:text-secondary"
                    }
                `}
            >
                <RiApps2Fill className="w-3.5 h-3.5" />
                All
            </button>

            {/* Category tabs */}
            {CATEGORIES.map((cat) => {
                const meta = TAB_META[cat];
                if (!meta) return null;
                const Icon = meta.icon;
                const isActive = selectedCategory === cat;

                return (
                    <button
                        key={cat}
                        onClick={() => navigate(cat)}
                        className={`
                            flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold
                            border whitespace-nowrap transition-all duration-200
                            ${isActive
                                ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/20"
                                : "bg-white text-gray-600 border-gray-200 hover:border-secondary/40 hover:text-secondary"
                            }
                        `}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                    </button>
                );
            })}
        </div>
    );
}
