"use client";

import { useState } from "react";
import { CheckoutTemplateDoc } from "@/lib/types/game";
import { checkoutTemplatesApiClient } from "@/services/checkoutTemplates/checkoutTemplatesApi.client";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import TemplateForm, { TemplatePayload } from "./TemplateForm";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: (created: CheckoutTemplateDoc) => void;
}

export default function NewTemplateModal({ open, onClose, onCreated }: Props) {
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (payload: TemplatePayload) => {
        setSaving(true);
        try {
            const res = await checkoutTemplatesApiClient.create({
                key: payload.key,
                label: payload.label,
                fields: payload.fields,
                enabled: payload.enabled,
            });
            toast.success("Template created");
            onCreated(res.data);
            onClose();
        } catch (err) {
            const msg = isAxiosError(err)
                ? err.response?.data?.message
                : undefined;
            toast.error(msg || "Failed to create template");
        } finally {
            setSaving(false);
        }
    };

    return (
        <TemplateForm
            key={open ? "open" : "closed"}
            open={open}
            mode="create"
            saving={saving}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}
