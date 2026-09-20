"use client";

import type { Game, RegionPricing, Variant } from "@/lib/types/game";

type MetaEventName = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

type MetaEventParams = {
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    content_type?: "product";
    contents?: { id: string; quantity: number; item_price?: number }[];
    currency?: string;
    value?: number;
    num_items?: number;
    order_id?: string;
};

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

const cleanCurrency = (currency?: string) => (currency || "INR").toUpperCase();
const variantId = (variant: Variant) => String(variant._id || variant.slug || variant.name);

export function createMetaEventId(prefix: string) {
    const random = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    return `${prefix}_${Date.now()}_${random}`;
}

export function purchaseEventId(orderId: string) {
    return `purchase_${orderId}`;
}

export function readMetaBrowserData() {
    const cookies = Object.fromEntries(
        document.cookie
            .split(";")
            .map((entry) => entry.trim().split(/=(.*)/, 2))
            .filter(([key]) => Boolean(key))
    );

    return {
        fbp: cookies._fbp || "",
        fbc: cookies._fbc || "",
        eventSourceUrl: window.location.href,
    };
}

export function trackMetaEvent(
    eventName: MetaEventName,
    params: MetaEventParams,
    eventId = createMetaEventId(eventName.toLowerCase())
) {
    const send = (attempt = 0) => {
        if (typeof window.fbq === "function") {
            window.fbq("track", eventName, params, { eventID: eventId });
            return;
        }

        // GTM loads asynchronously, so allow the pixel a few seconds to become ready.
        if (attempt < 20) window.setTimeout(() => send(attempt + 1), 250);
    };

    send();
    return true;
}

export function productEventParams(game: Game, variant?: Variant | null, pricing?: RegionPricing | null, qty = 1): MetaEventParams {
    const id = variant ? variantId(variant) : String(game._id || game.slug);
    const value = pricing ? Number(pricing.discountedPrice ?? pricing.price) * qty : undefined;

    return {
        content_ids: [id],
        content_name: variant ? `${game.name} - ${variant.name}` : game.name,
        content_category: game.category || game.checkoutTemplate || "digital_product",
        content_type: "product",
        contents: [{ id, quantity: qty, ...(pricing ? { item_price: Number(pricing.discountedPrice ?? pricing.price) } : {}) }],
        ...(pricing ? { currency: cleanCurrency(pricing.currency), value, num_items: qty } : {}),
    };
}
