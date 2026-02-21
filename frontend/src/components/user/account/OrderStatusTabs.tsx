"use client";

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
];

interface OrderStatusTabsProps {
    activeTab: string;
    onTabChange: (status: string) => void;
}

export default function OrderStatusTabs({ activeTab, onTabChange }: OrderStatusTabsProps) {
    return (
        <div className="overflow-x-auto">
            <div className="flex gap-6 border-b border-border pb-2 min-w-max">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className={`pb-2 text-sm font-medium transition-all relative whitespace-nowrap ${
                            activeTab === tab.key
                                ? "text-secondary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-secondary rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
