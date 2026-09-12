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
    /**
     * Whether there are unsaved changes. When false the submit button is
     * disabled. Defaults to true so forms that don't track this still work.
     */
    isDirty?: boolean;
    children: ReactNode;
}

export default function FormWrapper({
    title,
    isEdit,
    loading,
    onSubmit,
    submitLabel,
    onCancel,
    isDirty = true,
    children,
}: FormWrapperProps) {
    const router = useRouter();

    const handleCancel = () => {
        onCancel ? onCancel() : router.back();
    };

    return (
        <form
            onSubmit={onSubmit}
            className="p-6  mx-auto space-y-8 bg-white rounded-xl shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Go Back"
                >
                    <FaArrowLeft size={16} />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">
                    {title}
                </h1>
            </div>

            {/* Content */}
            {children}

            {/*
              * Footer Actions — pinned to the bottom of the viewport so Save stays
              * reachable on long forms without scrolling to the end.
              * The negative margins cancel the form's own p-6 padding so the bar
              * spans the full width of the card.
              */}
            <div className="sticky bottom-0 z-20 -mx-6 -mb-6 flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm rounded-b-xl">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                    Cancel
                </button>
                <SubmitButton
                    isLoading={loading}
                    disabled={!isDirty}
                    title={isDirty ? undefined : "No changes to save"}
                    label={submitLabel || (isEdit ? "Update" : "Create")}
                    fullWidth={false}
                    className="px-6 py-2.5"
                />
            </div>
        </form>
    );
}
