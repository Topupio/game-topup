"use client";

import { useState } from "react";
import { Variant } from "@/lib/types/game";
import { TbTrash, TbChevronDown, TbChevronUp, TbGripVertical } from "react-icons/tb";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Input from "@/components/form/Input";
import StatusToggle from "@/components/form/StatusToggle";
import ImageUploader from "@/components/form/ImageUploader";
import RegionPricingTable from "./RegionPricingTable";
interface Props {
    /** Unique ID this card is registered under for drag and drop. */
    id: string;
    variant: Variant;
    index: number;
    /** True while ANY variant in the list is being dragged. See `bodyHidden` below. */
    forceCollapsed?: boolean;
    checkoutTemplate: string;
    onChange: (updated: Variant) => void;
    onDelete: () => void;
    onImageChange: (file: File | null, preview: string | null) => void;
}

export default function VariantCard({ id, variant, index, checkoutTemplate, forceCollapsed, onChange, onDelete, onImageChange }: Props) {
    const [collapsed, setCollapsed] = useState(false);

    /*
     * useSortable registers this card with the DndContext in VariantManager and
     * hands back everything needed to make it draggable:
     *
     *   setNodeRef          - ref for the element that moves (the whole card)
     *   transform/transition - the position dnd-kit wants the card to sit at right
     *                          now, applied via inline style
     *   setActivatorNodeRef  - ref for the element that STARTS a drag (the grip)
     *   attributes/listeners - accessibility props + mouse/touch/keyboard handlers;
     *                          these go on the grip, not the card, so that clicking
     *                          the header still toggles the accordion
     *   isDragging           - true while this specific card is in mid-drag
     */
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const update = (partial: Partial<Variant>) => {
        onChange({ ...variant, ...partial });
    };

    /*
     * The body is hidden either because the admin collapsed this card, or because
     * a drag is in progress (every card collapses during a drag so the list stays
     * short). Note that `collapsed` is deliberately NOT modified during a drag —
     * that way each card springs back to whatever the admin had open once the
     * drag finishes, with no extra state to save and restore.
     */
    const bodyHidden = collapsed || forceCollapsed;

    return (
        <div
            // Makes the whole card the thing that slides around during a drag.
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                isDragging ? "border-blue-300 opacity-40" : "border-gray-200"
            }`}
        >
            {/* Header — always visible */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition bg-gray-50/50"
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {/*
                      * The grip is the ONLY thing that starts a drag: the drag
                      * listeners live here rather than on the header, so clicking
                      * the header still expands/collapses the card. stopPropagation
                      * keeps a click on the grip from reaching the header's toggle.
                      */}
                    <button
                        type="button"
                        ref={setActivatorNodeRef}
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Reorder variant ${variant.name || index + 1}`}
                        title="Drag to reorder"
                        // touch-none stops mobile browsers treating a drag on the
                        // grip as a page scroll.
                        className="p-0.5 -ml-1 text-gray-300 hover:text-gray-500 rounded cursor-grab active:cursor-grabbing touch-none shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                        <TbGripVertical size={16} />
                    </button>
                    <span className="text-[11px] font-semibold text-white bg-gray-400 w-5 h-5 rounded flex items-center justify-center shrink-0">
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
                    {variant.isPopular && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 shrink-0">
                            Popular
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete variant"
                    >
                        <TbTrash size={15} />
                    </button>
                    {bodyHidden ? <TbChevronDown size={16} className="text-gray-400" /> : <TbChevronUp size={16} className="text-gray-400" />}
                </div>
            </div>

            {/* Body — collapsible; also force-collapsed while dragging */}
            {!bodyHidden && (
                <div className="border-t border-gray-100">
                    {/* ── Section: Basic Info ── */}
                    <div className="p-4 flex gap-4">
                        {/* Image */}
                        <div className="w-[110px] shrink-0">
                            <ImageUploader
                                imageUrl={variant.imageUrl || null}
                                aspectRatio={1}
                                compact
                                onChange={(file, preview) => {
                                    onImageChange(file, preview);
                                    update({ imageUrl: preview });
                                }}
                            />
                        </div>

                        {/* Fields */}
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Input
                                    label="Variant Name"
                                    placeholder="e.g. Gems 170"
                                    required
                                    value={variant.name}
                                    onChange={(e) => update({ name: e.target.value })}
                                />
                                <Input
                                    label="Quantity"
                                    type="number"
                                    placeholder="e.g. 170"
                                    value={variant.quantity ?? ""}
                                    onChange={(e) =>
                                        update({
                                            quantity: e.target.value ? parseInt(e.target.value) : null,
                                        })
                                    }
                                />
                                <Input
                                    label="Unit"
                                    placeholder="e.g. Gems"
                                    value={variant.unit || ""}
                                    onChange={(e) => update({ unit: e.target.value })}
                                />
                                <Input
                                    label="Delivery Time"
                                    placeholder="Instant Delivery"
                                    value={variant.deliveryTime}
                                    onChange={(e) => update({ deliveryTime: e.target.value })}
                                />
                            </div>

                            {/* Status + Popular inline */}
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <StatusToggle
                                        value={variant.status}
                                        onChange={(status) => update({ status })}
                                    />
                                    <span className="text-xs text-gray-500">
                                        {variant.status === "active" ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={variant.isPopular}
                                        onChange={(e) => update({ isPopular: e.target.checked })}
                                        className="rounded text-amber-500 focus:ring-amber-200"
                                    />
                                    <span className="text-xs text-gray-500">Mark as popular</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ── Section: Pricing ── */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Global Pricing
                        </p>
                        <RegionPricingTable
                            pricing={variant.regionPricing}
                            onChange={(regionPricing) => update({ regionPricing })}
                        />
                    </div>

                    {/* ── Section: Auto Fulfillment (API) ── */}
                    {(checkoutTemplate === "uid_topup" || checkoutTemplate === "gift_cards") && (
                        <div className="px-4 py-3 border-t border-purple-100 bg-purple-50/60">
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">
                                Auto Fulfillment (API)
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label={checkoutTemplate === "gift_cards" ? "API Platform" : "API Game Name"}
                                    placeholder={checkoutTemplate === "gift_cards" ? "e.g. psn, steam, xbox" : "e.g. mobilelegend"}
                                    value={variant.apiGameName || ""}
                                    onChange={(e) => update({ apiGameName: e.target.value })}
                                />
                                <Input
                                    label={checkoutTemplate === "gift_cards" ? "API Denomination" : "API Pack ID"}
                                    placeholder={checkoutTemplate === "gift_cards" ? "e.g. 50" : "e.g. 86"}
                                    value={variant.apiPackId || ""}
                                    onChange={(e) => update({ apiPackId: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-purple-400 mt-2">
                                Set both fields to enable automatic order processing via Gamers Workshop API
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
