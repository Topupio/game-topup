import { ordersApiServer } from "@/services/orders/ordersApi.server";
import UserOrderDetailClient from "@/components/user/orders/UserOrderDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
//     const { id } = await params;
//     return {
//         title: `Order Details | GameTopup`,
//     };
// }

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const res = await ordersApiServer.getOrderDetails(id);
        if (!res.success || !res.data) {
            notFound();
        }

        return <UserOrderDetailClient order={res.data} />;
    } catch (error) {
        console.error("Failed to fetch order details:", error);
        notFound();
    }
}
