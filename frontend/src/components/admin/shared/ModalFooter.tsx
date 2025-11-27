"use client";

import React from "react";

type Props = {
    primaryLabel?: string;
    onPrimary?: () => void;
    primaryClassName?: string;
    secondaryLabel?: string;
    onSecondary?: () => void;
};

export default function ModalFooter({
    primaryLabel = "Save",
    onPrimary,
    primaryClassName = "bg-black text-white",
    secondaryLabel = "Cancel",
    onSecondary,
}: Props) {
    return (
        <div className="flex gap-2 mt-4">
            <button
                onClick={onPrimary}
                className={`flex-1 py-2 rounded-lg ${primaryClassName}`}
            >
                {primaryLabel}
            </button>

            <button
                onClick={onSecondary}
                className="flex-1 py-2 bg-gray-200 rounded-lg"
            >
                {secondaryLabel}
            </button>
        </div>
    );
}
