import {
    RiAlertFill,
    RiErrorWarningFill,
    RiTimeFill,
    RiUserUnfollowFill,
    RiMailCloseFill
} from "react-icons/ri";
import Link from "next/link";
import { DashboardActionRequired } from "@/services/dashboard/types";

export default function ActionRequiredPanel({ actions }: { actions: DashboardActionRequired }) {

    if (!actions) return null;

    const actionList = [
        {
            label: "Orders waiting for processing",
            count: actions.ordersToProcess,
            icon: RiAlertFill,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            href: "/admin/orders?status=paid"
        },
        {
            label: "Stuck processing orders",
            count: actions.stuckOrders,
            icon: RiTimeFill,
            color: "text-orange-600",
            bg: "bg-orange-500/10",
            href: "/admin/orders?status=processing&filter=stuck"
        },
        {
            label: "Pending payments",
            count: actions.pendingPayments,
            icon: RiTimeFill,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            href: "/admin/orders?paymentStatus=pending"
        },
        {
            label: "Failed payments today",
            count: actions.failedPaymentsToday,
            icon: RiErrorWarningFill,
            color: "text-red-600",
            bg: "bg-red-500/10",
            href: "/admin/orders?paymentStatus=failed&range=today"
        },
        {
            label: "Unverified users",
            count: actions.unverifiedUsers,
            icon: RiMailCloseFill,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
            href: "/admin/users?verified=false"
        },
        {
            label: "Blocked users",
            count: actions.blockedUsers,
            icon: RiUserUnfollowFill,
            color: "text-gray-600",
            bg: "bg-gray-500/10",
            href: "/admin/users?status=blocked"
        }
    ];

    const visibleActions = actionList.filter(a => a.count > 0);

    if (!visibleActions.length) {
        return (
            <div className="bg-white border shadow-sm rounded-xl p-6 h-full flex items-center justify-center text-gray-500">
                🎉 No urgent actions right now
            </div>
        );
    }

    return (
        <div className="bg-white border shadow-sm rounded-xl p-3 md:p-6 h-full">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Action Required</h3>

            <div className="space-y-4">
                {visibleActions.map((action, index) => (
                    <Link
                        key={index}
                        href={action.href}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${action.bg} ${action.color}`}>
                                <action.icon size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
                                {action.label}
                            </span>
                        </div>

                        <span className={`text-sm font-bold ${action.color} bg-white px-2 py-0.5 rounded-full border shadow-sm`}>
                            {action.count}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
