"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import SubmitButton from "@/components/ui/SubmitButton";

interface Props {
    title: string;
    isEdit: boolean;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel?: () => void;
    children: ReactNode;
    submitLabel?: string;
}

export default function AdminFormShell({
    title,
    isEdit,
    loading,
    onSubmit,
    onCancel,
    children,
    submitLabel,
}: Props) {
    const router = useRouter();

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-muted/50">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Go Back"
                >
                    <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>

            {/* Body */}
            <div className="p-6 space-y-8">
                {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted border-t border-border flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-medium transition text-sm"
                >
                    Cancel
                </button>
                <SubmitButton
                    isLoading={loading}
                    label={submitLabel || (isEdit ? "Save Changes" : "Create")}
                />
            </div>
        </form>
    );
}
