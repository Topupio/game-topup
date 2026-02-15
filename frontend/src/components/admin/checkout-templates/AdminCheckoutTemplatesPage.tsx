"use client";

import { CHECKOUT_TEMPLATES } from "@/lib/constants/checkoutTemplates";
import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import TemplateCard from "./TemplateCard";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

const templates = Object.values(CHECKOUT_TEMPLATES);

export default function AdminCheckoutTemplatesPage() {
    return (
        <div>
            <AdminToolbar
                title="Checkout Templates"
                actions={
                    <button
                        onClick={() => toast.info("Add template — coming soon")}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition"
                    >
                        <FiPlus size={18} /> Add Template
                    </button>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                    <TemplateCard key={template.key} template={template} />
                ))}
            </div>
        </div>
    );
}
