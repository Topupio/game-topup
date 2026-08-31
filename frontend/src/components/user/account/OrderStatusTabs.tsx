"use client";

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "expired", label: "Expired" },
    { key: "refunded", label: "Refunded" },
];

interface OrderStatusTabsProps {
    activeTab: string;
    onTabChange: (status: string) => void;
}

export default function OrderStatusTabs({ activeTab, onTabChange }: OrderStatusTabsProps) {
    return (
        <>
            {/* Desktop - underline tabs */}
            <div className="hidden lg:block overflow-x-auto hide-scrollbar">
                <div className="flex gap-4 sm:gap-6 border-b border-border">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`py-2.5 text-sm font-medium transition-all relative whitespace-nowrap ${
                                activeTab === tab.key
                                    ? "text-secondary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-secondary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile - scrollable chips */}
            <div className="lg:hidden -mx-3 overflow-x-auto hide-scrollbar px-3">
                <div className="flex w-max gap-2">
                    {STATUS_TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                                    active
                                        ? "border-secondary bg-secondary text-white"
                                        : "border-gray-200 bg-white text-gray-600"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
