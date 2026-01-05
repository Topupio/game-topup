import { ordersApiServer } from "@/services/orders/ordersApi.server";
import AdminOrderPage from "@/components/admin/orders/AdminOrderPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Order Management | Admin Dashboard",
};

export default async function OrdersAdminPage() {
    // Initial fetch for first page
    const initialData = await ordersApiServer.adminGetOrders({ page: 1, limit: 12 });

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <AdminOrderPage initialData={initialData} />
        </div>
    );
}
