"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type Option = {
    label: string;
    value: string;
};

type Props = {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    error?: string;
};

export default function FilterDropdown({
    label,
    options,
    value,
    onChange,
    placeholder = "All",
    className = "w-full md:w-72",
    error
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(() =>
        options.find(opt => opt.value === value),
        [options, value]);

    const filteredOptions = useMemo(() =>
        options.filter(opt =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        ),
        [options, search]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-foreground mb-1">
                    {label}
                </label>
            )}

            {/* Main Toggle Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-4 py-2 bg-card border rounded-xl shadow-sm transition-all duration-200 text-left
                    ${isOpen ? 'ring-2 ring-indigo-100 border-indigo-500' : 'border-border hover:border-border'}
                    ${error ? 'border-red-500 ring-red-50 focus:ring-red-100' : ''}
                `}
            >
                <span className={`block truncate ${!value ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="flex items-center gap-2">
                    {value && (
                        <FiX
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect("");
                            }}
                        />
                    )}
                    <FiChevronDown className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </span>
            </button>

            {/* Error Message */}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm"
                    >
                        {/* Search Input */}
                        <div className="p-2 border-b border-border bg-muted/50">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                            <button
                                type="button"
                                onClick={() => handleSelect("")}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-muted text-foreground'}`}
                            >
                                {placeholder}
                            </button>

                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${value === opt.value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-muted-foreground italic">
                                    No results found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
