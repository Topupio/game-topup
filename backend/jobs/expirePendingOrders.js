import Order from "../models/order.model.js";

export const expirePendingOrders = async () => {
    const cutoff = new Date(Date.now() - 5 * 60 * 60 * 1000);

    const staleOrders = await Order.find({
        orderStatus: "pending",
        paymentStatus: "pending",
        createdAt: { $lt: cutoff },
    });

    for (const order of staleOrders) {
        order.orderStatus = "expired";
        order.tracking.push({
            status: "expired",
            message: "Order expired automatically after 5 hours without payment",
        });
        await order.save();
    }

    return { expired: staleOrders.length };
};
