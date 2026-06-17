import { Delivery, DeliveryItem, DeliveryKind } from "@/services/orders/types";

/**
 * Maps a game's checkout template key to the structured delivery card it should use.
 * Templates not listed here have no structured delivery (free-form admin note only).
 */
export const TEMPLATE_TO_DELIVERY_KIND: Record<string, DeliveryKind> = {
    ai_subscriptions: "credentials",
    login_topup: "credentials",
    gift_cards: "code",
};

export const deliveryKindForTemplate = (
    templateKey?: string
): DeliveryKind | null => {
    if (!templateKey) return null;
    return TEMPLATE_TO_DELIVERY_KIND[templateKey] ?? null;
};

/** Default credential rows admins start from when delivering account access. */
export const DEFAULT_CREDENTIAL_ITEMS: DeliveryItem[] = [
    { label: "Login Email", value: "", secret: false },
    { label: "Password", value: "", secret: true },
];

/** Default how-to steps per delivery kind. */
export const DEFAULT_STEPS: Record<DeliveryKind, string[]> = {
    credentials: [
        "Open the app or website and tap Sign In.",
        "Enter the email and password above.",
        "Start using your subscription.",
    ],
    code: [
        "Open the store app on your device.",
        "Go to your account and choose Redeem code.",
        "Paste the code above and confirm.",
    ],
};

/** A blank, pre-seeded delivery object for a given kind (used by the admin editor). */
export const emptyDelivery = (kind: DeliveryKind): Delivery => ({
    kind,
    intro: "",
    items: kind === "credentials" ? DEFAULT_CREDENTIAL_ITEMS.map((i) => ({ ...i })) : [],
    code: "",
    steps: [...DEFAULT_STEPS[kind]],
    notice: "",
});
