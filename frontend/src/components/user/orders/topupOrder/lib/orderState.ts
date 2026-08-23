import { Order } from "@/services/orders/types";

/**
 * Where a top-up order sits in its lifecycle, from the customer's point of view.
 *
 * These are derived, not stored. The backend tracks `paymentStatus` and `orderStatus`
 * separately and neither of them captures "the customer told us they paid, an admin
 * hasn't confirmed it yet" — that is the `verifying` state below, and it is the whole
 * reason this mapping exists.
 */
export type OrderState =
    | "awaiting_payment"
    | "verifying"
    | "processing"
    | "delivered"
    | "closed";

/** Terminal statuses: the order is over, whatever the payment status says. */
const CLOSED_STATUSES = new Set(["expired", "cancelled", "failed", "refunded"]);

/**
 * Top-up templates: the balance lands in an account the customer already owns, so
 * nothing is handed over and all three share the payment → verify → deliver story.
 *
 * Excludes gift_cards and ai_subscriptions, where the customer is waiting to *receive*
 * a redeem code or a new account's credentials — those keep the generic order layout.
 */
const TOPUP_TEMPLATES = new Set(["uid_topup", "live_apps_topup", "login_topup", "genshin_login"]);

export function isTopupOrder(order: Order): boolean {
    return TOPUP_TEMPLATES.has(order.game?.checkoutTemplate ?? "");
}

/** Login top-ups need the customer to contact support before we can deliver. */
export function isLoginTopup(order: Order): boolean {
    return order.game?.checkoutTemplate === "login_topup" || order.game?.checkoutTemplate === "genshin_login";
}

/**
 * Order matters here. `paymentStatus` and `orderStatus` move independently — a refunded
 * order can still read `paymentStatus: "paid"` — so terminal and completed statuses are
 * checked before anything payment-related.
 */
export function deriveOrderState(order: Order): OrderState {
    if (CLOSED_STATUSES.has(order.orderStatus)) return "closed";
    if (order.orderStatus === "completed") return "delivered";
    if (order.paymentStatus === "paid") return "processing";

    // Payment is still pending. A submitted UTR is the customer's claim that they have
    // paid; an admin matches it against the bank statement before the status moves.
    if (order.paymentInfo?.utrNumber) return "verifying";

    return "awaiting_payment";
}

export interface Step {
    label: string;
    state: "done" | "now" | "todo";
}

const STEPS = ["Placed", "Payment", "Verifying", "Delivered"];
const ACTIVE_STEP: Record<OrderState, number> = {
    awaiting_payment: 1,
    verifying: 2,
    processing: 3,
    delivered: 4,
    closed: -1, // unused — stepsForState returns null first
};

// Login top-ups need the customer to message support after paying, so their journey has
// an extra step the other templates don't.
const LOGIN_STEPS = ["Placed", "Paid", "Contact us", "We log in", "Delivered"];
const LOGIN_ACTIVE_STEP: Record<OrderState, number> = {
    awaiting_payment: 1,
    verifying: 1,
    processing: 2, // paid — waiting on the customer to make contact
    delivered: 5,
    closed: -1,
};

/** Stepper entries, or null for a cancelled/refunded order with no progress to show. */
export function stepsForState(state: OrderState, loginFlow = false): Step[] | null {
    if (state === "closed") return null;

    const labels = loginFlow ? LOGIN_STEPS : STEPS;
    const active = loginFlow ? LOGIN_ACTIVE_STEP[state] : ACTIVE_STEP[state];

    return labels.map((label, index) => {
        if (index < active) return { label, state: "done" as const };
        if (index === active) return { label, state: "now" as const };
        return { label, state: "todo" as const };
    });
}

/**
 * Customer-facing name for the kind of order this is.
 *
 * `game.checkoutTemplate` is the reliable signal — it drives the whole checkout flow —
 * so it wins over `game.category`, which is free text an admin can rename.
 */
const TEMPLATE_LABELS: Record<string, string> = {
    uid_topup: "UID Top-Up",
    login_topup: "Login Top-Up",
    live_apps_topup: "Live Apps Top-Up",
    gift_cards: "Gift Cards",
    ai_subscriptions: "AI & Subscriptions",
    genshin_login: "Login Top-Up",
};

export function orderCategoryLabel(order: Order): string | null {
    const template = order.game?.checkoutTemplate ?? "";
    if (TEMPLATE_LABELS[template]) return TEMPLATE_LABELS[template];

    const category = order.game?.category?.trim();
    if (!category) return null;

    return category.replace(/\b\w/g, (c) => c.toUpperCase());
}
