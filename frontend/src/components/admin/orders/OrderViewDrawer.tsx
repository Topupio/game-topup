"use client";

import Drawer from "@/components/ui/Drawer";
import AdminCard from "@/components/admin/shared/AdminCard";

type Props = {
    open: boolean;
    onClose: () => void;
    data: { id: string; user: string; game: string; amount: string } | null;
};

export default function OrderViewDrawer({ open, onClose, data }: Props) {
    return (
        <Drawer open={open} onClose={onClose}>
            <AdminCard>
                <h2 className="text-xl font-semibold text-foreground mb-4">Order Details</h2>
                <div className="space-y-4">
                    <p className="font-semibold text-foreground">
                        <strong>Order ID:</strong> #{data?.id}
                    </p>
                    <p className="font-semibold text-foreground">
                        <strong>User:</strong> {data?.user}
                    </p>
                    <p className="font-semibold text-foreground">
                        <strong>Game:</strong> {data?.game}
                    </p>
                    <p className="font-semibold text-foreground">
                        <strong>Amount:</strong> {data?.amount}
                    </p>
                </div>
                <div className="mt-6">
                    <button onClick={onClose} className="flex items-center justify-center px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition">
                        <span>Close</span>
                    </button>
                </div>
            </AdminCard>
        </Drawer>
    );
}
