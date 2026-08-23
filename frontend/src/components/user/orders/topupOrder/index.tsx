"use client";

import Link from "next/link";
import Image from "next/image";
import {
    RiArrowLeftLine,
    RiCustomerService2Line,
    RiMapPinLine,
    RiNotification3Line,
} from "react-icons/ri";
import { Order } from "@/services/orders/types";
import { useCurrency } from "@/context/CurrencyContext";
import AdminMessageCard, { hasRichContent } from "@/components/user/orders/AdminMessageCard";
import DeliveryCard from "@/components/user/orders/DeliveryCard";
import { deriveOrderState, isLoginTopup, stepsForState } from "./lib/orderState";
import OrderHero from "./hero/OrderHero";
import DeliveredHero from "./hero/DeliveredHero";
import OrderStepper from "./hero/OrderStepper";
import PaymentCard from "./states/PaymentCard";
import PaymentAccordion from "./states/PaymentAccordion";
import VerifyingCard from "./states/VerifyingCard";
import ProcessingCard from "./states/ProcessingCard";
import LoginActionCard from "./states/LoginActionCard";
import ClosedCard from "./states/ClosedCard";
import DeliveredSummary from "./states/DeliveredSummary";
import OrderTimeline from "./shared/OrderTimeline";
import AccountDetails from "./shared/AccountDetails";
import TrustStrip from "./shared/TrustStrip";

interface Props {
    order: Order;
}

/**
 * State-driven order detail page for top-up orders (uid / live apps / login).
 *
 * Shows one centrepiece per lifecycle state instead of every section at once. The
 * `verifying` state exists because submitting a UTR does not move `paymentStatus` — an
 * admin verifies it manually — so without it the customer sees the payment QR again and
 * reasonably concludes their payment failed.
 */
export default function TopupOrderDetail({ order }: Props) {
    const { formatPrice } = useCurrency();

    const state = deriveOrderState(order);
    const loginFlow = isLoginTopup(order);
    const steps = stepsForState(state, loginFlow);
    const amountLabel = formatPrice(order.amount, order.currency || "USD");

    const adminMessage = order.adminNote?.trim() || "";
    const hasAdminMessage = hasRichContent(adminMessage);

    const gameName = order.game?.name ?? "Game";
    const productName = order.productSnapshot?.name ?? "Product";
    const reload = () => window.location.reload();

    return (
        <div className="min-h-screen bg-background px-3 pb-16 pt-22 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-7xl">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-secondary"
                    >
                        <RiArrowLeftLine /> Back to My Account
                    </Link>

                    {hasAdminMessage && (
                        <Link
                            href="#admin-message"
                            className="relative inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[11px] font-bold text-secondary transition hover:bg-secondary hover:text-white"
                        >
                            <RiNotification3Line className="h-3.5 w-3.5" />
                            Order update
                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
                    {/* Main column */}
                    <div className="space-y-3 sm:space-y-4">
                        {state === "delivered" ? (
                            <DeliveredHero order={order} amountLabel={amountLabel} />
                        ) : (
                            <OrderHero order={order} state={state} amountLabel={amountLabel} />
                        )}

                        {steps && (
                            <div className="px-1 py-1.5 sm:py-2">
                                <OrderStepper steps={steps} />
                            </div>
                        )}

                        {hasAdminMessage && <AdminMessageCard message={adminMessage} />}

                        {/* State centrepiece */}
                        {state === "awaiting_payment" && (
                            <PaymentCard order={order} onUtrSubmitted={reload} />
                        )}

                        {state === "verifying" && (
                            <>
                                <VerifyingCard
                                    utrNumber={order.paymentInfo!.utrNumber!}
                                    utrSubmittedAt={order.paymentInfo?.utrSubmittedAt}
                                />
                                <PaymentAccordion orderId={order._id} onUtrSubmitted={reload} />
                            </>
                        )}

                        {state === "processing" &&
                            (loginFlow ? (
                                <LoginActionCard order={order} amountLabel={amountLabel} />
                            ) : (
                                <ProcessingCard />
                            ))}

                        {(state === "awaiting_payment" || state === "verifying") && <TrustStrip />}

                        {state === "delivered" && (
                            <DeliveredSummary order={order} amountLabel={amountLabel} />
                        )}

                        {state === "closed" && <ClosedCard order={order} />}

                        {/* Top-ups rarely have one, but login_topup can — don't hide it. */}
                        {order.delivery?.kind && <DeliveryCard delivery={order.delivery} />}

                        {/* Delivered state already lists these in the summary. */}
                        {state !== "delivered" && <AccountDetails userInputs={order.userInputs} />}

                        <OrderTimeline tracking={order.tracking} />
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                            <div className="flex items-center gap-4 lg:block lg:text-center">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted p-1 lg:mx-auto lg:mb-4 lg:h-24 lg:w-24">
                                    {order.game?.imageUrl ? (
                                        <Image
                                            src={order.game.imageUrl}
                                            alt={gameName}
                                            fill
                                            sizes="(min-width: 1024px) 96px, 80px"
                                            className="rounded-xl object-cover p-1"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
                                        {gameName}
                                    </h3>
                                    <p className="mt-1 text-sm font-medium leading-snug text-muted-foreground">
                                        {productName}
                                    </p>
                                    <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm lg:justify-center">
                                        <RiMapPinLine className="text-secondary" />
                                        <span>Global delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
                            <div className="mb-1.5 flex items-center gap-2">
                                <RiCustomerService2Line className="text-secondary" />
                                <h3 className="text-base font-bold tracking-tight text-foreground">Need help?</h3>
                            </div>
                            <p className="mb-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                Share your order ID with support if anything looks wrong.
                            </p>
                            <Link
                                href="/contact"
                                className="block w-full rounded-xl bg-secondary py-2.5 text-center text-sm font-bold text-white transition hover:opacity-90"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
