"use client";

import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
    RiWhatsappFill,
    RiFileCopyLine,
    RiKey2Line,
    RiShieldCheckLine,
    RiFlashlightFill,
    RiLockLine,
} from "react-icons/ri";
import { Order } from "@/services/orders/types";
import { SUPPORT_WHATSAPP_DISPLAY, whatsappLink } from "@/lib/constants/support";

interface Props {
    order: Order;
    amountLabel: string;
}

const REASONS = [
    {
        icon: RiKey2Line,
        title: "Login top-ups need a one-time login.",
        body: "We sign in, add your item, and sign out — the game sends an OTP to you during this step.",
    },
    {
        icon: RiShieldCheckLine,
        title: "We message only after you do.",
        body: "This protects you from scam accounts pretending to be Topupio and keeps our official number safe.",
    },
    {
        icon: RiFlashlightFill,
        title: "It's fast.",
        body: "Most login top-ups finish in 15–20 minutes once you reach us during business hours.",
    },
];

/**
 * Shown once a login top-up is paid.
 *
 * These orders cannot be delivered without the customer: an admin has to sign into their
 * game account, and the OTP goes to the customer. Support deliberately never messages
 * first (anti-impersonation), so the order sits until the customer reaches out — which
 * means this page has to ask them to, not tell them to wait.
 */
export default function LoginActionCard({ order, amountLabel }: Props) {
    const productName = order.productSnapshot?.name ?? "my order";
    const gameName = order.game?.name ?? "";

    const message =
        `Hi Topupio 👋 I placed a login top-up order #${order.orderId} ` +
        `(${productName}${gameName ? `, ${gameName}` : ""}). ` +
        `I've paid ${amountLabel}. What's the next step to complete my order?`;

    const copyOrderId = async () => {
        try {
            await navigator.clipboard.writeText(order.orderId);
            toast.success("Order ID copied");
        } catch {
            toast.error("Failed to copy order ID");
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="space-y-3 sm:space-y-4"
        >
            {/* Action needed */}
            <div className="overflow-hidden rounded-2xl border border-success/30 bg-card shadow-soft">
                <p className="bg-success/10 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-success">
                    One quick step to get your top-up
                </p>

                <div className="p-5 text-center sm:p-6">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-2xl text-success">
                        <RiWhatsappFill />
                    </span>

                    <h2 className="mt-4 text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">
                        Message us to start delivery
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        This is a <b className="text-foreground">login top-up</b> — our team signs
                        into your game account to add the item. To keep it secure,{" "}
                        <b className="text-foreground">we never message first</b>. Tap below and
                        send us the ready-made message — we&apos;ll reply and guide you through the{" "}
                        <b className="text-foreground">login &amp; OTP</b> step.
                    </p>

                    <a
                        href={whatsappLink(message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-[linear-gradient(110deg,#16a34a,#22c55e)] px-4 py-3.5 text-white transition hover:opacity-95"
                    >
                        <RiWhatsappFill className="h-6 w-6 shrink-0" />
                        <span className="text-left">
                            <span className="block text-sm font-bold tracking-tight">Chat with us on WhatsApp</span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-emerald-100">
                                Your Order ID is attached automatically
                            </span>
                        </span>
                    </a>

                    {/* Preview of what gets sent, so tapping the button isn't a leap of faith. */}
                    <div className="mt-3 rounded-xl border border-border bg-muted/50 p-3 text-left sm:p-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Message we&apos;ll send for you
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-success">✓ auto-filled</span>
                        </div>
                        <p className="mt-2 rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-foreground">
                            {message}
                        </p>
                    </div>

                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                        You&apos;ll be chatting with{" "}
                        <b className="text-foreground">{SUPPORT_WHATSAPP_DISPLAY}</b> · Topupio
                        Official
                    </p>

                    <button
                        type="button"
                        onClick={copyOrderId}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold tracking-tight text-foreground transition hover:bg-muted"
                    >
                        <RiFileCopyLine /> Copy Order ID
                    </button>
                </div>
            </div>

            {/* Why */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                    Why do I message you?
                </h3>
                <ul className="mt-3.5 space-y-3">
                    {REASONS.map(({ icon: Icon, title, body }) => (
                        <li key={title} className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-secondary">
                                <Icon className="h-4 w-4" />
                            </span>
                            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                <b className="text-foreground">{title}</b> {body}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Security */}
            <div className="flex gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3.5 sm:p-4">
                <RiLockLine className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-[11px] leading-relaxed text-warning sm:text-xs">
                    Only share your login OTP inside the chat with our official number above.{" "}
                    <b>
                        Topupio staff will never ask for your UPI PIN, password reset, or bank OTP.
                    </b>
                </p>
            </div>
        </motion.section>
    );
}
