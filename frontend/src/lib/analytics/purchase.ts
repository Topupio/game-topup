"use client";

import { useEffect } from "react";
import type { Order } from "@/services/orders/types";
import { purchaseEventId, trackMetaEvent } from "@/lib/analytics/meta";

const ATTRIBUTION_KEY = "topupio_session_attribution_v1";
const PURCHASE_KEY_PREFIX = "topupio_browser_purchase_v2_";

const AI_SOURCES: Record<string, string> = {
  "chatgpt.com": "chatgpt",
  "chat.openai.com": "chatgpt",
  "claude.ai": "claude",
  "perplexity.ai": "perplexity",
  "gemini.google.com": "gemini",
  "copilot.microsoft.com": "copilot",
  "poe.com": "poe",
  "meta.ai": "meta_ai",
  "you.com": "you_com",
};

type Attribution = {
  trafficOrigin: "ai" | "google" | "other_referral" | "direct";
  aiPlatform: string;
  sourceHostname: string;
  landingPage: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const hostnameFrom = (value: string) => {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www./, "");
  } catch {
    return "";
  }
};

export function classifyAttribution(url: string, referrer: string): Attribution {
  const page = new URL(url);
  const campaignSource = (page.searchParams.get("utm_source") || "").toLowerCase();
  const referrerHost = hostnameFrom(referrer);
  const source = campaignSource || referrerHost;
  const aiEntry = Object.entries(AI_SOURCES).find(([host]) => source === host || source.endsWith("." + host) || source.includes(host));

  if (aiEntry) {
    return { trafficOrigin: "ai", aiPlatform: aiEntry[1], sourceHostname: source, landingPage: page.pathname };
  }
  if (page.searchParams.has("gclid") || source === "google" || source.startsWith("google.") || referrerHost.startsWith("google.")) {
    return { trafficOrigin: "google", aiPlatform: "none", sourceHostname: source || "google", landingPage: page.pathname };
  }
  if (source) {
    return { trafficOrigin: "other_referral", aiPlatform: "none", sourceHostname: source, landingPage: page.pathname };
  }
  return { trafficOrigin: "direct", aiPlatform: "none", sourceHostname: "direct", landingPage: page.pathname };
}

export function captureSessionAttribution() {
  try {
    if (!sessionStorage.getItem(ATTRIBUTION_KEY)) {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(classifyAttribution(window.location.href, document.referrer)));
    }
  } catch {
    // Analytics must never affect shopping or checkout.
  }
}

function readAttribution(): Attribution {
  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    // Fall through to current-page attribution.
  }
  return classifyAttribution(window.location.href, document.referrer);
}

function sendPurchase(params: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
  window.gtag("event", "purchase", params);
}

export function usePurchaseAnalytics(order: Order) {
  useEffect(() => {
    captureSessionAttribution();
    const purchased = order.paymentStatus === "paid";
    if (!purchased || order.orderStatus === "refunded" || order.orderStatus === "cancelled" || order.orderStatus === "failed") return;

    const transactionId = order.orderId || order._id;
    const sentKey = PURCHASE_KEY_PREFIX + transactionId;
    try {
      if (localStorage.getItem(sentKey)) return;
    } catch {
      // GA4 also deduplicates purchase events by transaction_id.
    }

    const attribution = readAttribution();
    const quantity = Math.max(1, Number(order.quantity) || Number(order.productSnapshot?.qty) || 1);
    const value = Number(order.amount) || 0;
    const itemName = order.productSnapshot?.name || order.product || order.game?.name || "Product";
    const itemId = order.product || order.game?._id || itemName;

    sendPurchase({
      transaction_id: transactionId,
      value,
      currency: (order.currency || "INR").toUpperCase(),
      payment_type: order.paymentMethod,
      traffic_origin: attribution.trafficOrigin,
      ai_platform: attribution.aiPlatform,
      source_hostname: attribution.sourceHostname,
      landing_page: attribution.landingPage,
      items: [{
        item_id: itemId,
        item_name: itemName,
        item_category: order.game?.checkoutTemplate || "digital_product",
        price: quantity > 0 ? value / quantity : value,
        quantity,
      }],
    });

    trackMetaEvent("Purchase", {
      value,
      currency: (order.currency || "INR").toUpperCase(),
      content_ids: [String(itemId)],
      content_name: itemName,
      content_category: order.game?.checkoutTemplate || "digital_product",
      content_type: "product",
      contents: [{
        id: String(itemId),
        quantity,
        item_price: quantity > 0 ? value / quantity : value,
      }],
      num_items: quantity,
      order_id: transactionId,
    }, purchaseEventId(transactionId));

    try {
      localStorage.setItem(sentKey, new Date().toISOString());
    } catch {
      // Do not interrupt the order page when storage is unavailable.
    }
  }, [order]);
}
