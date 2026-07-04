"use client";

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "expired", label: "Expired" },
];

interface OrderStatusTabsProps {
    activeTab: string;
    onTabChange: (status: string) => void;
}

export default function OrderStatusTabs({ activeTab, onTabChange }: OrderStatusTabsProps) {
    return (
        <div className="overflow-x-auto hide-scrollbar">
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
    );
}
