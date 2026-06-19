"use client";

import Modal from "./Modal";
import ModalFooter from "@/components/admin/shared/ModalFooter";

interface Props {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmClassName?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmClassName = "bg-black text-white",
    onConfirm,
    onCancel,
}: Props) {
    return (
        <Modal open={open} onClose={onCancel}>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-500 mb-2">{message}</p>
            <ModalFooter
                primaryLabel={confirmLabel}
                primaryClassName={confirmClassName}
                onPrimary={onConfirm}
                secondaryLabel={cancelLabel}
                onSecondary={onCancel}
            />
        </Modal>
    );
}
