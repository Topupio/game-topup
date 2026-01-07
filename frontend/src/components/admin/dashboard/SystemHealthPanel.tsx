"use client";

import { RiServerLine, RiDatabase2Line, RiBankCardLine, RiMailSendLine } from "react-icons/ri";

export default function SystemHealthPanel() {
    const systems = [
        { label: "Server", status: "Online", icon: RiServerLine, color: "text-green-500", bg: "bg-green-50" },
        { label: "Database", status: "Connected", icon: RiDatabase2Line, color: "text-green-500", bg: "bg-green-50" },
        { label: "Payment Gateway", status: "Healthy", icon: RiBankCardLine, color: "text-yellow-500", bg: "bg-yellow-50" }, // Simulating a warning/info state
        { label: "Email Service", status: "Working", icon: RiMailSendLine, color: "text-green-500", bg: "bg-green-50" },
    ];

    return (
        <div className="bg-white border text-card-foreground shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {systems.map((system, index) => (
                    <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-100 bg-gray-50/50 text-center">
                        <div className={`p-2 rounded-full mb-2 ${system.bg} ${system.color}`}>
                            <system.icon size={20} />
                        </div>
                        <h4 className="text-sm font-medium text-gray-700">{system.label}</h4>
                        <span className={`text-xs font-bold mt-1 ${system.color}`}>
                            {system.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
