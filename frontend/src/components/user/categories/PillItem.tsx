"use client";

interface PillItemProps {
    label: string;
    selected?: boolean;
    onChange?: (selected: boolean) => void;
}

export default function PillItem({ label, selected = false, onChange }: PillItemProps) {
    return (
        <button
            onClick={() => onChange?.(!selected)}
            className={`px-4 py-2 text-xs rounded-xl border transition-all duration-300 w-full text-left font-medium ${selected
                    ? "border-secondary bg-secondary/20 text-secondary"
                    : "border-white/10 bg-white/5 text-white hover:border-secondary"
                } backdrop-blur-xl`}
        >
            {label}
        </button>
    );
}
