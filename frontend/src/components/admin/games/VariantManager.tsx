"use client";

import { useState } from "react";
import { Variant } from "@/lib/types/game";
import { TbPlus } from "react-icons/tb";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import VariantCard from "./VariantCard";
import VariantDragGhost from "./VariantDragGhost";

interface Props {
    variants: Variant[];
    checkoutTemplate: string;
    onChange: (variants: Variant[]) => void;
    onVariantImageChange?: (index: number, file: File | null, preview: string | null) => void;
    /** Called after a drag reorder so the parent can move anything else it keys by index. */
    onVariantsReorder?: (from: number, to: number) => void;
}

/*
 * WHY THIS COMPONENT KEEPS A SECOND ARRAY OF "DRAG IDS"
 *
 * Drag and drop needs one ID per row that stays the same while the list is on
 * screen. The two obvious candidates don't work:
 *
 *   - the array index: it changes the moment you reorder, which is exactly when
 *     we need it to hold still;
 *   - variant._id: only exists for variants already saved in the database, so a
 *     variant you just added with "Add Variant" doesn't have one yet.
 *
 * So we keep a second array, `dragIds`, holding one generated ID per variant.
 * Every time variants are added, deleted, or reordered, we apply the identical
 * operation to `dragIds`, so position N in one array always describes the same
 * variant as position N in the other:
 *
 *   variants  [ Gems 80 ][ Gems 170 ][ Brawl Pass ]
 *   dragIds   [ "v0"    ][ "v1"     ][ "v2"       ]
 *
 * `nextIdNumber` is just a counter that makes each generated ID unique.
 */

/** Builds a fresh, empty variant for the "Add Variant" button. */
function createEmptyVariant(): Variant {
    return {
        name: "",
        slug: "",
        quantity: null,
        unit: "",
        regionPricing: [{
            region: "global",
            currency: "USD",
            symbol: "$",
            price: 0,
            discountedPrice: 0,
        }],
        status: "active",
        isPopular: false,
        deliveryTime: "Instant Delivery",
        imageUrl: null,
        imagePublicId: null,
    };
}

export default function VariantManager({
    variants,
    checkoutTemplate,
    onChange,
    onVariantImageChange,
    onVariantsReorder,
}: Props) {
    const [dragIds, setDragIds] = useState<string[]>(() => variants.map((_, i) => `v${i}`));
    const [nextIdNumber, setNextIdNumber] = useState(variants.length);

    // ID of the variant currently being dragged, or null when nothing is being
    // dragged. Drives the floating preview and the collapse-everything behaviour.
    const [draggingId, setDraggingId] = useState<string | null>(null);

    /*
     * `variants` is a prop, so the parent can hand us a completely different
     * array at any moment — most often when the edit page finishes loading a game
     * from the API and swaps an empty list for the real one. When that happens
     * our `dragIds` array is the wrong length, so we top it up right here, during
     * render, before anything reads it.
     *
     * Calling setState during render looks alarming, but it is a supported React
     * pattern for this exact case ("adjusting state when a prop changes"). React
     * discards this render and immediately re-runs the component with the new
     * state, so nothing downstream ever sees the mismatched arrays.
     *
     * We can't just read `dragIds` below, because on the render where we fix it
     * `dragIds` still holds the stale value. So we compute the corrected values
     * into local variables and use those for the rest of this render.
     */
    let currentDragIds = dragIds;
    let currentNextIdNumber = nextIdNumber;

    if (dragIds.length !== variants.length) {
        // Keep the IDs we already have, and mint a new one for each extra variant.
        currentDragIds = variants.map((_, index) => dragIds[index] ?? `v${currentNextIdNumber++}`);
        setDragIds(currentDragIds);
        setNextIdNumber(currentNextIdNumber);
    }

    // Use the database _id when the variant has one (it's guaranteed unique),
    // otherwise fall back to the generated drag ID.
    const rowIds = variants.map((variant, index) => variant._id || currentDragIds[index]);
    console.log("rowIds",rowIds);
    

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require 6px of movement before a drag starts. Without this, a plain
            // click on the grip would count as a (zero-distance) drag.
            activationConstraint: { distance: 6 },
        }),
        // Lets keyboard users reorder: focus a grip, press Space, arrow up/down,
        // press Space again to drop.
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const addVariant = () => {
        setDragIds([...currentDragIds, `v${currentNextIdNumber}`]);
        setNextIdNumber(currentNextIdNumber + 1);
        onChange([...variants, createEmptyVariant()]);
    };

    const updateVariant = (index: number, updated: Variant) => {
        const copy = [...variants];
        copy[index] = updated;
        onChange(copy);
    };

    const deleteVariant = (index: number) => {
        // Remove the same position from both arrays so they stay lined up.
        setDragIds(currentDragIds.filter((_, i) => i !== index));
        onChange(variants.filter((_, i) => i !== index));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setDraggingId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setDraggingId(null);

        // `active` is the row being dragged; `over` is the row it was dropped on
        // (null if it was dropped outside the list).
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const fromIndex = rowIds.indexOf(String(active.id));
        const toIndex = rowIds.indexOf(String(over.id));
        if (fromIndex === -1 || toIndex === -1) return;

        // arrayMove returns a new array with the item moved. Apply the identical
        // move to both arrays so variants and their drag IDs stay lined up.
        setDragIds(arrayMove(currentDragIds, fromIndex, toIndex));
        onChange(arrayMove(variants, fromIndex, toIndex));

        // The parent stores not-yet-uploaded variant images in a map keyed by
        // index, so it has to shift those keys by the same move.
        onVariantsReorder?.(fromIndex, toIndex);
    };

    // Which variant to show in the floating preview that follows the cursor.
    const draggingIndex = draggingId ? rowIds.indexOf(draggingId) : -1;

    // Text read aloud by screen readers while dragging.
    const screenReaderAnnouncements = {
        onDragStart: ({ active }: { active: { id: string | number } }) => {
            const index = rowIds.indexOf(String(active.id));
            const name = variants[index]?.name || `#${index + 1}`;
            return `Picked up variant ${name}, position ${index + 1} of ${variants.length}.`;
        },
        onDragOver: ({ over }: { over: { id: string | number } | null }) => {
            if (!over) return undefined;
            const index = rowIds.indexOf(String(over.id));
            return `Variant moved to position ${index + 1} of ${variants.length}.`;
        },
        onDragEnd: ({ over }: { over: { id: string | number } | null }) => {
            if (!over) return "Variant dropped.";
            const index = rowIds.indexOf(String(over.id));
            return `Variant dropped at position ${index + 1} of ${variants.length}.`;
        },
        onDragCancel: () => "Reordering cancelled.",
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {variants.length} variant{variants.length !== 1 ? "s" : ""}
                    {variants.length > 1 && (
                        <span className="text-gray-400"> · drag to reorder</span>
                    )}
                </p>
                <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition font-medium"
                >
                    <TbPlus size={16} /> Add Variant
                </button>
            </div>

            {variants.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">
                        No variants yet. Click Add Variant to add items/packages.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                        e.g., Gems 80, Gems 170, Brawl Pass
                    </p>
                </div>
            ) : (
                /*
                 * DndContext     — turns on drag and drop for everything inside it.
                 * SortableContext — tells dnd-kit these rows are one sortable
                 *                   vertical list, and which IDs belong to it.
                 * DragOverlay    — the preview element that follows the cursor.
                 */
                <DndContext
                    sensors={sensors}
                    // Work out which row you're hovering by comparing centre points.
                    collisionDetection={closestCenter}
                    modifiers={[
                        restrictToVerticalAxis,   // no sideways dragging
                        restrictToParentElement,  // can't drag outside the list
                    ]}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setDraggingId(null)}
                    accessibility={{ announcements: screenReaderAnnouncements }}
                >
                    <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            {variants.map((variant, index) => (
                                <VariantCard
                                    key={rowIds[index]}
                                    id={rowIds[index]}
                                    variant={variant}
                                    index={index}
                                    checkoutTemplate={checkoutTemplate}
                                    // While any drag is happening, collapse every card
                                    // so the list stays short and easy to aim at.
                                    forceCollapsed={draggingId !== null}
                                    onChange={(updated) => updateVariant(index, updated)}
                                    onDelete={() => deleteVariant(index)}
                                    onImageChange={(file, preview) =>
                                        onVariantImageChange?.(index, file, preview)
                                    }
                                />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {draggingIndex !== -1 ? (
                            <VariantDragGhost
                                variant={variants[draggingIndex]}
                                index={draggingIndex}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}
