"use client";

import React from "react";
import Modal from "@/components/ui/Modal";

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (nextStatus: string) => void;
    currentStatus?: string;
};

const STATUSES = ["Pending", "Paid", "In Progress", "Completed", "Cancelled"] as const;

export default function OrderUpdateModal({ open, onClose, onSave, currentStatus }: Props) {
    const [value, setValue] = React.useState<string>(currentStatus || STATUSES[0]);

    React.useEffect(() => {
        setValue(currentStatus || STATUSES[0]);
    }, [currentStatus]);

    return (
        <Modal open={open} onClose={onClose}>
            <h2 className="text-lg font-semibold mb-4">Update Order Status</h2>
            <select
                className="w-full border rounded-lg p-2 mb-4"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            >
                {STATUSES.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>
            <div className="flex gap-2">
                <button className="flex-1 py-2 bg-black text-white rounded-lg" onClick={() => onSave(value)}>
                    Save Changes
                </button>
                <button className="flex-1 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </Modal>
    );
}
