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
            className={`px-4 py-2 text-xs rounded-lg border transition-all duration-200 w-full text-left font-medium ${
                selected
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-secondary/30 hover:text-foreground"
            }`}
        >
            {label}
        </button>
    );
}
