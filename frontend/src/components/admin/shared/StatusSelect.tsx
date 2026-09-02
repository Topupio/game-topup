"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

type Option<T extends string> = {
    label: string;
    value: T;
};

type Props<T extends string> = {
    id?: string;
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
};

/**
 * Status picker rendered in the DOM rather than as a native <select>.
 *
 * The native control's popup is drawn by the OS and dismisses itself whenever the
 * page moves underneath it, which made the admin status fields unusable. This
 * renders the list as normal elements, so nothing outside React can close it.
 */
export default function StatusSelect<T extends string>({
    id,
    options,
    value,
    onChange,
    disabled = false,
}: Props<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((opt) => opt.value === value);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 bg-gray-50 border rounded-xl p-3 text-gray-900 font-medium text-left transition outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
                }`}
            >
                <span className="truncate">{selected?.label ?? ""}</span>
                <FiChevronDown
                    className={`text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden p-1">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-md rounded-lg transition-colors ${
                                opt.value === value
                                    ? "bg-blue-50 text-blue-600 font-semibold"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
