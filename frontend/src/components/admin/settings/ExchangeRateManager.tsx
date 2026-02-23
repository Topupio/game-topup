"use client";

import { useState, useEffect } from "react";
import { exchangeRateApiClient } from "@/services/exchangeRate/exchangeRateApi.client";
import { ExchangeRate } from "@/services/exchangeRate/types";
import { CURRENCIES, getCurrencySymbol } from "@/lib/constants/currencies";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import ModalFooter from "@/components/admin/shared/ModalFooter";
import { RiEditLine, RiDeleteBinLine, RiAddLine, RiExchangeDollarLine } from "react-icons/ri";

export default function ExchangeRateManager() {
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable rates (local state for inline editing)
    const [editedRates, setEditedRates] = useState<Record<string, number>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Add currency modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCurrency, setNewCurrency] = useState("");
    const [newRate, setNewRate] = useState("");

    const fetchRates = async () => {
        try {
            const res = await exchangeRateApiClient.getAll();
            if (res.success) {
                setRates(res.data);
                const edits: Record<string, number> = {};
                for (const r of res.data) {
                    edits[r.targetCurrency] = r.rate;
                }
                setEditedRates(edits);
            }
        } catch {
            toast.error("Failed to fetch exchange rates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const handleRateChange = (currency: string, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num) && num >= 0) {
            setEditedRates((prev) => ({ ...prev, [currency]: num }));
            setHasChanges(true);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const ratesPayload = Object.entries(editedRates).map(([targetCurrency, rate]) => ({
                targetCurrency,
                rate,
            }));
            const res = await exchangeRateApiClient.bulkUpdate({ rates: ratesPayload });
            if (res.success) {
                toast.success("Exchange rates updated successfully");
                setHasChanges(false);
                await fetchRates();
            }
        } catch {
            toast.error("Failed to update exchange rates");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (rate: ExchangeRate) => {
        if (!rate._id) {
            toast.info("This is a default rate and cannot be deleted");
            return;
        }
        try {
            const res = await exchangeRateApiClient.deleteRate(rate._id);
            if (res.success) {
                toast.success(`Exchange rate for ${rate.targetCurrency} deleted`);
                await fetchRates();
            }
        } catch {
            toast.error("Failed to delete exchange rate");
        }
    };

    const handleAddCurrency = async () => {
        if (!newCurrency || !newRate) {
            toast.error("Please fill in all fields");
            return;
        }
        const rateNum = parseFloat(newRate);
        if (isNaN(rateNum) || rateNum <= 0) {
            toast.error("Please enter a valid rate");
            return;
        }

        // Check if currency already exists
        if (editedRates[newCurrency] !== undefined) {
            toast.error(`${newCurrency} already exists`);
            return;
        }

        setSaving(true);
        try {
            const res = await exchangeRateApiClient.bulkUpdate({
                rates: [{ targetCurrency: newCurrency, rate: rateNum }],
            });
            if (res.success) {
                toast.success(`Added exchange rate for ${newCurrency}`);
                setShowAddModal(false);
                setNewCurrency("");
                setNewRate("");
                await fetchRates();
            }
        } catch {
            toast.error("Failed to add exchange rate");
        } finally {
            setSaving(false);
        }
    };

    // Currencies not yet in the rates list
    const availableCurrencies = CURRENCIES.filter(
        (c) => c.code !== "USD" && !editedRates[c.code]
    );

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <RiExchangeDollarLine className="text-xl text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-900">Exchange Rates</h2>
                </div>
                <div className="flex justify-center py-12">
                    <span className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <RiExchangeDollarLine className="text-xl text-gray-600" />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Exchange Rates</h2>
                            <p className="text-sm text-gray-500">Base currency: USD ($1.00)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        disabled={availableCurrencies.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RiAddLine size={16} />
                        Add Currency
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-gray-500 font-medium">Currency</th>
                                <th className="text-left py-3 px-4 text-gray-500 font-medium">Symbol</th>
                                <th className="text-left py-3 px-4 text-gray-500 font-medium">Rate (1 USD =)</th>
                                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rates.map((rate) => (
                                <tr key={rate.targetCurrency} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="py-3 px-4">
                                        <span className="font-semibold text-gray-900">{rate.targetCurrency}</span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {getCurrencySymbol(rate.targetCurrency)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editedRates[rate.targetCurrency] ?? rate.rate}
                                            onChange={(e) => handleRateChange(rate.targetCurrency, e.target.value)}
                                            className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10"
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        {rate.isDefault ? (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                                Default
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                                                Custom
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => handleDelete(rate)}
                                            disabled={!rate._id}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={rate._id ? "Delete rate" : "Default rate cannot be deleted"}
                                        >
                                            <RiDeleteBinLine size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Save All Button */}
                {hasChanges && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Add Currency Modal */}
            <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Currency Rate</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                            value={newCurrency}
                            onChange={(e) => setNewCurrency(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                        >
                            <option value="">Select currency</option>
                            {availableCurrencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} - {c.name} ({c.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rate (1 USD = ?)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newRate}
                            onChange={(e) => setNewRate(e.target.value)}
                            placeholder="e.g. 96 for INR"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                        />
                    </div>
                </div>

                <ModalFooter
                    primaryLabel={saving ? "Adding..." : "Add Rate"}
                    onPrimary={handleAddCurrency}
                    secondaryLabel="Cancel"
                    onSecondary={() => setShowAddModal(false)}
                />
            </Modal>
        </>
    );
}
