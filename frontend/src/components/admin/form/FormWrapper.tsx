"use client";

import { ReactNode } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";

interface FormWrapperProps {
    title: string;
    isEdit: boolean;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
    onCancel?: () => void;
    children: ReactNode;
}

export default function FormWrapper({
    title,
    isEdit,
    loading,
    onSubmit,
    submitLabel,
    onCancel,
    children,
}: FormWrapperProps) {
    const router = useRouter();

    const handleCancel = () => {
        onCancel ? onCancel() : router.back();
    };

    return (
        <form
            onSubmit={onSubmit}
            className="p-6  mx-auto space-y-8 bg-card rounded-xl shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Go Back"
                >
                    <FaArrowLeft size={16} />
                </button>
                <h1 className="text-2xl font-semibold text-foreground">
                    {title}
                </h1>
            </div>

            {/* Content */}
            {children}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted font-medium transition"
                >
                    Cancel
                </button>
                <SubmitButton
                    isLoading={loading}
                    label={submitLabel || (isEdit ? "Update" : "Create")}
                    fullWidth={false}
                    className="px-6 py-2.5"
                />
            </div>
        </form>
    );
}
