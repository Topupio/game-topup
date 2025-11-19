"use client";

import { FiSearch } from "react-icons/fi";

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function SearchBox({ value, onChange, placeholder = "Search orders..." }: Props) {
    return (
        <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
            />
        </div>
    );
}
