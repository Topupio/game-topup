import { DashboardOrder } from "@/services/dashboard/types";
import Link from "next/link";

export default function RecentOrdersTable({ orders }: { orders: DashboardOrder[] }) {

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 border-green-200";
            case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
            case "failed": return "bg-red-100 text-red-700 border-red-200";
            case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-muted text-foreground border-border";
        }
    };

    return (
        <div className="bg-card border text-card-foreground shadow-sm rounded-xl overflow-hidden">
            <div className="p-3 md:p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Orders</h3>
                <Link href="/admin/orders" className="text-xs md:text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm text-left">
                    <thead className="text-[10px] md:text-xs text-muted-foreground uppercase bg-muted border-b">
                        <tr>
                            <th className="px-2 md:px-4 py-2 md:py-3">Order ID</th>
                            <th className="px-2 md:px-4 py-2 md:py-3">User</th>
                            <th className="px-2 md:px-4 py-2 md:py-3">Game</th>
                            <th className="px-2 md:px-4 py-2 md:py-3">Product</th>
                            <th className="px-2 md:px-4 py-2 md:py-3">Amount</th>
                            <th className="px-2 md:px-4 py-2 md:py-3">Status</th>
                            <th className="px-2 md:px-4 py-2 md:py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                            <tr key={order._id} className="bg-card hover:bg-muted transition">
                                <td className="px-2 md:px-4 py-2 md:py-4 font-medium text-foreground">{order.orderId}</td>
                                <td className="px-2 md:px-4 py-2 md:py-4 text-muted-foreground">{order.user?.name ?? "Deleted User"}</td>
                                <td className="px-2 md:px-4 py-2 md:py-4 text-muted-foreground">{order.game?.name ?? "Deleted Game"}</td>
                                <td className="px-2 md:px-4 py-2 md:py-4 text-muted-foreground">{order.product?.name ?? "Deleted Product"}</td>
                                <td className="px-2 md:px-4 py-2 md:py-4 font-semibold text-foreground">$ {order.amount}</td>
                                <td className="px-2 md:px-4 py-2 md:py-4">
                                    <span className={`px-1.5 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium border ${getStatusStyles(order.orderStatus)}`}>
                                        {order.orderStatus.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-2 md:px-4 py-2 md:py-4">
                                    <Link href={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-[10px] md:text-xs uppercase tracking-wide">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
