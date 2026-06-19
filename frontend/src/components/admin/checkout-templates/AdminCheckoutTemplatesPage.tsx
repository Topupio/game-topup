"use client";

import { useState, useEffect } from "react";
import { CheckoutTemplateDoc } from "@/lib/types/game";
import { checkoutTemplatesApiClient } from "@/services/checkoutTemplates/checkoutTemplatesApi.client";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import TemplateCard from "./TemplateCard";
import EditTemplateModal from "./EditTemplateModal";
import NewTemplateModal from "./NewTemplateModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

export default function AdminCheckoutTemplatesPage() {
    const [templates, setTemplates] = useState<CheckoutTemplateDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] =
        useState<CheckoutTemplateDoc | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<CheckoutTemplateDoc | null>(null);

    useEffect(() => {
        checkoutTemplatesApiClient
            .getAll()
            .then((res) => setTemplates(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSaved = (updated: CheckoutTemplateDoc) => {
        setTemplates((prev) =>
            prev.map((t) => (t.key === updated.key ? updated : t))
        );
    };

    const handleCreated = (created: CheckoutTemplateDoc) => {
        setTemplates((prev) => [...prev, created]);
    };

    const confirmDelete = async () => {
        if (!deleting) return;
        const key = deleting.key;
        try {
            await checkoutTemplatesApiClient.remove(key);
            setTemplates((prev) => prev.filter((t) => t.key !== key));
            toast.success("Template deleted");
        } catch (err) {
            const msg = isAxiosError(err)
                ? err.response?.data?.message
                : undefined;
            toast.error(msg || "Failed to delete template");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div>
            <AdminToolbar
                title="Checkout Templates"
                actions={
                    <button
                        onClick={() => setCreating(true)}
                        className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                        + New Template
                    </button>
                }
            />

            {loading ? (
                <div className="text-sm text-gray-400 py-8 text-center">
                    Loading templates...
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.key}
                            template={template}
                            onEdit={() => setEditingTemplate(template)}
                            onDelete={() => setDeleting(template)}
                        />
                    ))}
                </div>
            )}

            {editingTemplate && (
                <EditTemplateModal
                    open={!!editingTemplate}
                    onClose={() => setEditingTemplate(null)}
                    template={editingTemplate}
                    onSaved={handleSaved}
                />
            )}

            <NewTemplateModal
                open={creating}
                onClose={() => setCreating(false)}
                onCreated={handleCreated}
            />

            <ConfirmModal
                open={!!deleting}
                title="Delete template?"
                message={`Permanently delete "${deleting?.label}"? This cannot be undone.`}
                confirmLabel="Delete"
                confirmClassName="bg-red-500 text-white"
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}
