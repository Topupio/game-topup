"use client";

import { Variant } from "@/lib/types/game";
import { TbGripVertical } from "react-icons/tb";

interface Props {
    variant: Variant;
    index: number;
}

/** Compact row that follows the cursor while a variant is being dragged. */
export default function VariantDragGhost({ variant, index }: Props) {
    return (
        <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-blue-300 ring-2 ring-blue-200 shadow-lg cursor-grabbing">
            <TbGripVertical size={16} className="text-blue-400 shrink-0" />
            <span className="text-[11px] font-semibold text-white bg-blue-500 w-5 h-5 rounded flex items-center justify-center shrink-0">
                {index + 1}
            </span>
            <span className="font-medium text-gray-800 truncate">
                {variant.name || "Untitled Variant"}
            </span>
            {variant.quantity && variant.unit && (
                <span className="text-xs text-gray-400 shrink-0">
                    · {variant.quantity} {variant.unit}
                </span>
            )}
            <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                    variant.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                }`}
            >
                {variant.status}
            </span>
        </div>
    );
}
