import { ordersApiServer } from "@/services/orders/ordersApi.server";
import OrderDetailPage from "@/components/admin/orders/OrderDetailPage";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Order #${id} | Admin Dashboard`,
    };
}

export default async function AdminOrderDetailServerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const res = await ordersApiServer.getOrderDetails(id);
        if (!res.success || !res.data) {
            notFound();
        }

        return (
            <div className="p-2 md:p-6 max-w-[1400px] mx-auto">
                <OrderDetailPage initialOrder={res.data} />
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch order details:", error);
        notFound();
    }
}
