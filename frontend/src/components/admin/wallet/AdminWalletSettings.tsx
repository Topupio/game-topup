"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatFixed } from "@/lib/utils/money";
import {
    walletAdminApiClient,
    type AdminWalletSettings as Settings,
} from "@/services/wallet/walletAdminApi.client";

/**
 * Wallet limits and switches.
 *
 * Amounts are stored in paise but edited in rupees — nobody wants to type 5000000 for
 * ₹50,000. Conversion happens at the edges of this form.
 */
export default function AdminWalletSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await walletAdminApiClient.getSettings();
                if (res.success) setSettings(res.data);
            } catch {
                toast.error("Could not load wallet settings");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((current) => (current ? { ...current, [key]: value } : current));
    };

    const save = async () => {
        if (!settings) return;

        setSaving(true);
        try {
            const res = await walletAdminApiClient.updateSettings({
                enabled: settings.enabled,
                upiTopupEnabled: settings.upiTopupEnabled,
                usdtTopupEnabled: settings.usdtTopupEnabled,
                walletPaymentEnabled: settings.walletPaymentEnabled,
                minTopupPaise: settings.minTopupPaise,
                maxTopupPaise: settings.maxTopupPaise,
                dailyTopupCapPaise: settings.dailyTopupCapPaise,
                maxBalancePaise: settings.maxBalancePaise,
                topupExpiryMinutes: settings.topupExpiryMinutes,
            });
            if (res.success) {
                setSettings(res.data);
                toast.success("Wallet settings saved");
            }
        } catch (error) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Could not save settings";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="h-96 animate-pulse rounded-xl bg-gray-100" />;
    }

    if (!settings) {
        return <p className="text-sm text-gray-500">Settings unavailable.</p>;
    }

    return (
        <div className="max-w-2xl space-y-6">
            <section className="rounded-xl border border-gray-300 bg-white p-5">
                <h2 className="text-base font-semibold text-gray-900">Availability</h2>
                <p className="mt-1 text-sm text-gray-500">
                    The master switch hides every wallet feature from customers. The rest control
                    individual methods.
                </p>

                <div className="mt-4 space-y-3">
                    <Toggle
                        label="Wallet enabled"
                        hint="Turn everything off without a deploy"
                        checked={settings.enabled}
                        onChange={(v) => update("enabled", v)}
                    />
                    <Toggle
                        label="UPI top-ups"
                        hint="Customer pays by QR, an admin verifies the UTR here"
                        checked={settings.upiTopupEnabled}
                        onChange={(v) => update("upiTopupEnabled", v)}
                    />
                    <Toggle
                        label="Crypto top-ups"
                        hint="Credited automatically once NOWPayments settles"
                        checked={settings.usdtTopupEnabled}
                        onChange={(v) => update("usdtTopupEnabled", v)}
                    />
                    <Toggle
                        label="Pay with wallet"
                        hint="Show the wallet as a payment option at checkout"
                        checked={settings.walletPaymentEnabled}
                        onChange={(v) => update("walletPaymentEnabled", v)}
                    />
                </div>
            </section>

            <section className="rounded-xl border border-gray-300 bg-white p-5">
                <h2 className="text-base font-semibold text-gray-900">Limits</h2>
                <p className="mt-1 text-sm text-gray-500">Entered in rupees.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <RupeeField
                        label="Minimum top-up"
                        paise={settings.minTopupPaise}
                        onChange={(paise) => update("minTopupPaise", paise)}
                    />
                    <RupeeField
                        label="Maximum per top-up"
                        paise={settings.maxTopupPaise}
                        onChange={(paise) => update("maxTopupPaise", paise)}
                    />
                    <RupeeField
                        label="Daily cap per customer"
                        paise={settings.dailyTopupCapPaise}
                        onChange={(paise) => update("dailyTopupCapPaise", paise)}
                        hint="Resets at midnight IST"
                    />
                    <RupeeField
                        label="Maximum balance"
                        paise={settings.maxBalancePaise}
                        onChange={(paise) => update("maxBalancePaise", paise)}
                        hint="There are no withdrawals, so this caps stuck funds"
                    />

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-900">
                            Top-up expiry (minutes)
                        </label>
                        <input
                            type="number"
                            min={5}
                            value={settings.topupExpiryMinutes}
                            onChange={(e) => update("topupExpiryMinutes", Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-secondary"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Unpaid top-ups expire. Ones awaiting review never do.
                        </p>
                    </div>
                </div>
            </section>

            <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
                {saving ? "Saving…" : "Save settings"}
            </button>
        </div>
    );
}

function Toggle({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
            <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900">{label}</span>
                {hint && <span className="block text-xs text-gray-500">{hint}</span>}
            </span>

            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#6366F1]"
            />
        </label>
    );
}

function RupeeField({
    label,
    paise,
    onChange,
    hint,
}: {
    label: string;
    paise: number;
    onChange: (paise: number) => void;
    hint?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">{label}</label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-secondary">
                <span className="text-gray-500">₹</span>
                <input
                    type="number"
                    min={0}
                    value={paise / 100}
                    onChange={(e) => onChange(Math.round(Number(e.target.value) * 100))}
                    className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                />
            </div>

            <p className="mt-1 text-xs text-gray-500">
                {hint || `Currently ${formatFixed(paise / 100, "INR")}`}
            </p>
        </div>
    );
}
