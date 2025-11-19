"use client";

import Drawer from "@/components/ui/Drawer";

type Props = {
    open: boolean;
    onClose: () => void;
    data: { id: string; user: string; game: string; amount: string } | null;
};

export default function OrderViewDrawer({ open, onClose, data }: Props) {
    return (
        <Drawer open={open} onClose={onClose}>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
                <div className="space-y-4">
                    <p className="font-semibold text-gray-700">
                        <strong>Order ID:</strong> #{data?.id}
                    </p>
                    <p className="font-semibold text-gray-700">
                        <strong>User:</strong> {data?.user}
                    </p>
                    <p className="font-semibold text-gray-700">
                        <strong>Game:</strong> {data?.game}
                    </p>
                    <p className="font-semibold text-gray-700">
                        <strong>Amount:</strong> {data?.amount}
                    </p>
                </div>
                <div className="mt-6">
                    <button onClick={onClose} className="flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 transition">
                        <span>Close</span>
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
