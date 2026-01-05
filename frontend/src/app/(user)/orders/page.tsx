import { ordersApiServer } from "@/services/orders/ordersApi.server";
import UserOrdersClient from "@/components/user/orders/UserOrdersClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Orders | GameTopup",
};

export default async function MyOrdersPage() {
    try {
        const res = await ordersApiServer.getMyOrders({ page: 1, limit: 10 });

        return (
            <div className="min-h-screen bg-primary pt-24 pb-16 px-4">
                <UserOrdersClient initialData={res} />
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        // Fallback or error state could be handled here
        return (
            <div className="min-h-screen bg-primary pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Failed to load orders</h1>
                    <p className="text-gray-400">Please try again later.</p>
                </div>
            </div>
        );
    }
}
