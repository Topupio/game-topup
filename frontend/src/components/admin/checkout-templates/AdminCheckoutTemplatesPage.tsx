"use client";

import { useState, useEffect } from "react";
import { CheckoutTemplateDoc } from "@/lib/types/game";
import { checkoutTemplatesApiClient } from "@/services/checkoutTemplates/checkoutTemplatesApi.client";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import TemplateCard from "./TemplateCard";
import EditTemplateModal from "./EditTemplateModal";

export default function AdminCheckoutTemplatesPage() {
    const [templates, setTemplates] = useState<CheckoutTemplateDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] =
        useState<CheckoutTemplateDoc | null>(null);

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

    return (
        <div>
            <AdminToolbar title="Checkout Templates" />

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
        </div>
    );
}
