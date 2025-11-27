"use client";

interface Props {
    value: "active" | "inactive";
    onChange: (val: "active" | "inactive") => void;
}

export default function StatusToggle({ value, onChange }: Props) {
    return (
        <div
            onClick={() => onChange(value === "active" ? "inactive" : "active")}
            className={`w-14 h-7 flex items-center rounded-full cursor-pointer transition
                ${value === "active" ? "bg-green-500" : "bg-gray-400"}`}
        >
            <div
                className={`w-6 h-6 bg-white rounded-full shadow transform transition
                    ${value === "active" ? "translate-x-7" : "translate-x-1"}`}
            />
        </div>
    );
}