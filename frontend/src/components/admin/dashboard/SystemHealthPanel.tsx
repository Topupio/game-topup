import { RiServerLine, RiDatabase2Line, RiBankCardLine, RiMailSendLine } from "react-icons/ri";
import { DashboardSystemHealth } from "@/services/dashboard/types";

interface Props {
    health?: DashboardSystemHealth;
}

export default function SystemHealthPanel({ health }: Props) {

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || "";
        if (s === "online" || s === "connected" || s === "healthy" || s === "working") {
            return { text: "text-green-600", bg: "bg-green-50" };
        }
        if (s === "degraded" || s === "slow") {
            return { text: "text-amber-600", bg: "bg-amber-50" };
        }
        return { text: "text-red-600", bg: "bg-red-50" };
    };

    const systems = [
        { label: "Server", status: health?.server || "Unknown", icon: RiServerLine },
        { label: "Database", status: health?.database || "Unknown", icon: RiDatabase2Line },
        { label: "Payment Gateway", status: health?.paymentGateway || "Unknown", icon: RiBankCardLine },
        { label: "Email Service", status: health?.emailService || "Unknown", icon: RiMailSendLine },
    ];

    return (
        <div className="bg-card border text-card-foreground shadow-sm rounded-xl p-3 md:p-6">
            <h3 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                System Health
                <span className="flex h-2 w-2 rounded-full bg-green-500 relative ml-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                </span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                {systems.map((system, index) => {
                    const style = getStatusColor(system.status);

                    return (
                        <div key={index} className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border ${style.bg} bg-opacity-30 text-center transition hover:shadow-sm`}>
                            <div className={`p-2 rounded-full mb-3 bg-card shadow-sm ${style.text}`}>
                                <system.icon size={20} />
                            </div>
                            <h4 className="text-sm font-medium text-muted-foreground">{system.label}</h4>
                            <span className={`text-xs font-bold mt-1 ${style.text}`}>
                                {system.status}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
