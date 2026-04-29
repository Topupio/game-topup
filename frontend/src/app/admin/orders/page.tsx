import { ordersApiServer } from "@/services/orders/ordersApi.server";
import AdminOrderPage from "@/components/admin/orders/AdminOrderPage";
import { Metadata } from "next";
import { AdminOrderQueue, OrderParams, OrderStatus } from "@/services/orders/types";

export const metadata: Metadata = {
    title: "Order Management | Admin Dashboard",
};

const ORDER_STATUSES: OrderStatus[] = [
    "pending",
    "paid",
    "processing",
    "completed",
    "cancelled",
    "failed",
    "expired",
];

type PageProps = {
    searchParams?: Promise<{
        queue?: string | string[];
        status?: string | string[];
    }>;
};

export default async function OrdersAdminPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const requestedQueue = Array.isArray(params?.queue) ? params?.queue[0] : params?.queue;
    const requestedStatus = Array.isArray(params?.status) ? params?.status[0] : params?.status;
    const initialQueue: AdminOrderQueue = requestedQueue === "upi_review"
        ? "upi_review"
        : ORDER_STATUSES.includes(requestedStatus as OrderStatus)
            ? requestedStatus as OrderStatus
            : "completed";

    const orderParams: OrderParams = {
        page: 1,
        limit: 12,
        ...(initialQueue === "upi_review" ? { queue: "upi_review" } : { status: initialQueue }),
    };

    const initialData = await ordersApiServer.adminGetOrders(orderParams);

    return (
        <div className="p-2 md:p-6 max-w-[1600px] mx-auto">
            <AdminOrderPage initialData={initialData} initialQueue={initialQueue} />
        </div>
    );
}
