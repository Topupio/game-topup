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
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Go Back"
                >
                    <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            {/* Body */}
            <div className="p-6 space-y-8">
                {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition text-sm"
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
