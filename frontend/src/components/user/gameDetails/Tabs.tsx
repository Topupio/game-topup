"use client";

interface TabsProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="mt-10 px-4 lg:px-0">
      <div className="flex gap-6 border-b border-white/10 pb-2">
        {[
          { id: "overview", label: "Overview" },
          { id: "products", label: "Products" },
          { id: "how", label: "How to Top-up" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-sm font-medium transition-all relative ${
              activeTab === tab.id ? "text-secondary" : "text-gray-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-secondary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
