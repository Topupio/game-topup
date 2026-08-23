"use client";

import OrderHero from "@/components/user/orders/topupOrder/hero/OrderHero";
import { OrderState } from "@/components/user/orders/topupOrder/lib/orderState";

const base: any = {
    orderId: "TP-2K41X9",
    quantity: 2,
    paymentMethod: "upi",
    orderStatus: "processing",
    paymentStatus: "pending",
    productSnapshot: { name: "8100 + 4050 Bonus Diamonds", qty: 2 },
    game: {
        name: "Mobile Legends: Bang Bang",
        checkoutTemplate: "uid_topup",
        imageUrl: "/vercel.svg",
    },
    paymentInfo: {},
};

const CASES: { state: OrderState; amount: string; order: any }[] = [
    { state: "awaiting_payment", amount: "₹1,499", order: base },
    { state: "verifying", amount: "₹1,499", order: base },
    {
        state: "processing",
        amount: "₹12,999",
        order: { ...base, game: { ...base.game, checkoutTemplate: "login_topup" } },
    },
    { state: "delivered", amount: "₹999", order: { ...base, productSnapshot: { name: "Weekly Pass", qty: 1 } } },
    { state: "closed", amount: "₹499", order: { ...base, orderStatus: "cancelled" } },
];

export default function Page() {
    return (
        <div className="mx-auto max-w-lg space-y-4 p-3">
            {CASES.map((c) => (
                <div key={c.state}>
                    <p className="mb-1 text-[10px] font-mono text-slate-500">{c.state}</p>
                    <OrderHero order={c.order} state={c.state} amountLabel={c.amount} />
                </div>
            ))}
        </div>
    );
}
