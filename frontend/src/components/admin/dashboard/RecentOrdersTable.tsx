import { DashboardOrder } from "@/services/dashboard/types";
import Link from "next/link";

export default function RecentOrdersTable({ orders }: { orders: DashboardOrder[] }) {

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 border-green-200";
            case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
            case "failed": return "bg-red-100 text-red-700 border-red-200";
            case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="bg-white border text-card-foreground shadow-sm rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Game</th>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order._id} className="bg-white hover:bg-gray-50 transition">
                                <td className="px-4 py-4 font-medium text-gray-900">{order.orderId}</td>
                                <td className="px-4 py-4 text-gray-500">{order.user?.name ?? "Deleted User"}</td>
                                <td className="px-4 py-4 text-gray-500">{order.game?.name ?? "Deleted Game"}</td>
                                <td className="px-4 py-4 text-gray-500">{order.product?.name ?? "Deleted Product"}</td>
                                <td className="px-4 py-4 font-semibold text-gray-900">$ {order.amount}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(order.orderStatus)}`}>
                                        {order.orderStatus.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <Link href={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide">
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
