"use client";

import { useEffect, useState } from "react";
import { paymentsApiClient } from "@/services/payments/paymentsApi.client";
import { PaymentSettings } from "@/services/payments/types";
import { toast } from "react-toastify";
import { RiLoader4Line, RiQrCodeLine, RiSaveLine, RiShieldCheckLine } from "react-icons/ri";

const EMPTY_SETTINGS: PaymentSettings = {
    upi: {
        enabled: false,
        upiId: "",
        payeeName: "Game Topup",
        instructions: "",
    },
};

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as {
            response?: { data?: { message?: string } };
        }).response;

        if (response?.data?.message) {
            return response.data.message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

export default function PaymentSettingsManager() {
    const [settings, setSettings] = useState<PaymentSettings>(EMPTY_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await paymentsApiClient.getPaymentSettings();
                setSettings(res.data);
            } catch {
                toast.error("Failed to load payment settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const updateUpiField = (
        field: keyof PaymentSettings["upi"],
        value: string | boolean
    ) => {
        setSettings((prev) => ({
            ...prev,
            upi: {
                ...prev.upi,
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await paymentsApiClient.updatePaymentSettings(settings);
            setSettings(res.data);
            toast.success("Payment settings updated");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to update payment settings"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-center py-10">
                    <RiLoader4Line className="animate-spin text-2xl text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-green-50 p-3 text-green-600">
                        <RiQrCodeLine className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            UPI QR Settings
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Configure the merchant UPI details used to generate dynamic QR codes per order.
                        </p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <RiShieldCheckLine />
                    Dynamic amount + order ref
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-5">
                    <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Enable UPI QR payments
                            </p>
                            <p className="text-xs text-gray-500">
                                Users will see UPI QR as a checkout option when this is enabled.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.upi.enabled}
                            onChange={(e) => updateUpiField("enabled", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                    </label>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Admin UPI ID
                        </label>
                        <input
                            type="text"
                            value={settings.upi.upiId}
                            onChange={(e) => updateUpiField("upiId", e.target.value)}
                            placeholder="yourupi@bank"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black/10"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This VPA is embedded into every QR. Example: merchant@upi
                        </p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Payee Name
                        </label>
                        <input
                            type="text"
                            value={settings.upi.payeeName}
                            onChange={(e) => updateUpiField("payeeName", e.target.value)}
                            placeholder="Game Topup"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black/10"
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Internal Payment Instructions
                        </label>
                        <textarea
                            value={settings.upi.instructions}
                            onChange={(e) => updateUpiField("instructions", e.target.value)}
                            placeholder="Example: Verify incoming payments using the order reference before marking the order as paid."
                            rows={7}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black/10"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This note is shown to the customer below the QR so you can guide verification expectations.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-900">
                            Recommended setup
                        </p>
                        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-amber-800">
                            <li>Use a merchant UPI ID dedicated to business collections.</li>
                            <li>Keep QR enabled only after verifying the UPI ID is active.</li>
                            <li>Match incoming payment amount and order reference before marking orders as paid.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? (
                        <RiLoader4Line className="animate-spin" />
                    ) : (
                        <RiSaveLine />
                    )}
                    Save Payment Settings
                </button>
            </div>
        </div>
    );
}
