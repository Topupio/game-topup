"use client";

import {
    RiCustomerService2Line,
    RiShieldCheckLine,
    RiTimeLine,
    RiVerifiedBadgeLine,
} from "react-icons/ri";

const trustItems = [
    { icon: RiShieldCheckLine, label: "Secure checkout" },
    { icon: RiTimeLine, label: "Fast digital delivery" },
    { icon: RiVerifiedBadgeLine, label: "Verified orders" },
    { icon: RiCustomerService2Line, label: "Support available" },
];

export default function CheckoutTrustStrip() {
    return (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-3">
            {trustItems.map(({ icon: Icon, label }) => (
                <div
                    key={label}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
                >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-secondary" />
                    <span className="leading-tight">{label}</span>
                </div>
            ))}
        </div>
    );
}
