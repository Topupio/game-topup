"use client";

import { TbReload, TbChecklist, TbClock, TbCheck, TbX } from "react-icons/tb";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const OPTIONS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending", icon: <TbClock /> },
    { key: "paid", label: "Paid", icon: <TbChecklist /> },
    { key: "inprogress", label: "In-Progress", icon: <TbReload /> },
    { key: "completed", label: "Completed", icon: <TbCheck /> },
    { key: "cancelled", label: "Cancelled", icon: <TbX /> },
];

export default function StatusFilter({ value, onChange }: Props) {
    return (
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
            {OPTIONS.map((item) => (
                <button
                    key={item.key}
                    onClick={() => onChange(item.key)}
                    className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm transition ${value === item.key
                            ? "bg-black text-white border-black"
                            : "bg-white border-gray-300 hover:bg-gray-100"
                        }`}
                >
                    {item.icon} {item.label}
                </button>
            ))}
        </div>
    );
}
