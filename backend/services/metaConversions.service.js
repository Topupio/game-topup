import crypto from "node:crypto";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

const DEFAULT_PIXEL_ID = "1259133966292578";
const DEFAULT_GRAPH_VERSION = "v23.0";
const CLAIM_TIMEOUT_MS = 10 * 60 * 1000;

const sha256 = (value) => crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");

const cleanPhone = (value) => String(value || "").replace(/\D/g, "");

function inputValue(order, matcher) {
    const item = (order.userInputs || []).find((entry) => {
        const key = String(entry.fieldKey || "").toLowerCase();
        const label = String(entry.label || "").toLowerCase();
        return matcher.test(key) || matcher.test(label);
    });
    return item?.value ? String(item.value) : "";
}

function configured() {
    return Boolean(process.env.META_CAPI_ACCESS_TOKEN && (process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID));
}

async function claimOrder(orderId) {
    const staleBefore = new Date(Date.now() - CLAIM_TIMEOUT_MS);
    return Order.findOneAndUpdate(
        {
            _id: orderId,
            paymentStatus: "paid",
            "metaTracking.capiSentAt": { $exists: false },
            $or: [
                { "metaTracking.capiSendingAt": { $exists: false } },
                { "metaTracking.capiSendingAt": { $lt: staleBefore } },
            ],
        },
        {
            $set: { "metaTracking.capiSendingAt": new Date() },
            $inc: { "metaTracking.capiAttempts": 1 },
        },
        { new: true }
    ).lean();
}

function buildUserData(order, user) {
    const data = {};
    if (user?.email) data.em = [sha256(user.email)];

    const phone = cleanPhone(inputValue(order, /phone|whatsapp|mobile/));
    if (phone) data.ph = [sha256(phone)];
    if (order.user) data.external_id = [sha256(order.user._id || order.user)];
    if (order.metaTracking?.fbp) data.fbp = order.metaTracking.fbp;
    if (order.metaTracking?.fbc) data.fbc = order.metaTracking.fbc;
    if (order.metaTracking?.clientIp) data.client_ip_address = order.metaTracking.clientIp;
    if (order.metaTracking?.userAgent) data.client_user_agent = order.metaTracking.userAgent;
    return data;
}

function buildEvent(order, user) {
    const quantity = Math.max(1, Number(order.quantity || order.productSnapshot?.qty) || 1);
    const value = Number(order.amount) || 0;
    const productId = String(order.product?._id || order.product || order.game?._id || order.game);
    const productName = order.productSnapshot?.name || order.game?.name || "Digital product";

    return {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `purchase_${order.orderId}`,
        action_source: "website",
        event_source_url: order.metaTracking?.eventSourceUrl || `https://topupio.com/orders/${order._id}`,
        user_data: buildUserData(order, user),
        custom_data: {
            value,
            currency: String(order.currency || "INR").toUpperCase(),
            order_id: order.orderId,
            content_ids: [productId],
            content_name: productName,
            content_type: "product",
            contents: [{ id: productId, quantity, item_price: quantity > 0 ? value / quantity : value }],
            num_items: quantity,
        },
    };
}

export async function sendMetaPurchase(orderOrId, options = {}) {
    if (!configured()) return { skipped: true, reason: "not_configured" };

    const rawId = orderOrId?._id || orderOrId;
    const order = options.force
        ? await Order.findById(rawId).lean()
        : await claimOrder(rawId);
    if (!order) return { skipped: true, reason: "already_sent_or_not_paid" };

    try {
        const user = await User.findById(order.user).select("email").lean();
        const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
        const graphVersion = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_VERSION;
        const url = new URL(`https://graph.facebook.com/${graphVersion}/${pixelId}/events`);
        url.searchParams.set("access_token", process.env.META_CAPI_ACCESS_TOKEN);

        const body = { data: [buildEvent(order, user)] };
        const testEventCode = options.testEventCode || process.env.META_CAPI_TEST_EVENT_CODE;
        if (testEventCode) body.test_event_code = testEventCode;

        const response = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(8000),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.error) {
            throw new Error(result.error?.message || `Meta CAPI returned HTTP ${response.status}`);
        }

        if (!options.force) {
            await Order.updateOne(
                { _id: order._id },
                {
                    $set: {
                        "metaTracking.capiSentAt": new Date(),
                        "metaTracking.capiEventId": `purchase_${order.orderId}`,
                    },
                    $unset: {
                        "metaTracking.capiSendingAt": 1,
                        "metaTracking.capiLastError": 1,
                    },
                }
            );
        }
        return { success: true, eventsReceived: result.events_received };
    } catch (error) {
        if (!options.force) {
            await Order.updateOne(
                { _id: order._id },
                {
                    $set: { "metaTracking.capiLastError": String(error.message || error).slice(0, 500) },
                    $unset: { "metaTracking.capiSendingAt": 1 },
                }
            );
        }
        console.error(`[META-CAPI] Purchase ${order.orderId} failed:`, error.message || error);
        return { success: false, error: error.message || String(error) };
    }
}

export function sendMetaPurchaseInBackground(orderOrId) {
    void sendMetaPurchase(orderOrId).catch((error) => {
        console.error("[META-CAPI] Unexpected purchase tracking error:", error);
    });
}

