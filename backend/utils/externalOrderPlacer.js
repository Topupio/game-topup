import Game from "../models/game.model.js";
import * as gwService from "../services/gamersWorkshop.service.js";

const ELIGIBLE_TEMPLATES = ["uid_topup", "gift_cards"];

/**
 * Attempt to place an external order via Gamers Workshop API
 * after payment is confirmed. Only for uid_topup and gift_cards templates
 * with apiGameName and apiPackId configured.
 */
export async function placeExternalOrderIfEligible(order) {
    const game = await Game.findById(order.game).lean();
    if (!game) return;

    const variant = game.variants.find(
        (v) => v._id.toString() === order.product.toString()
    );
    if (!variant) return;

    if (!ELIGIBLE_TEMPLATES.includes(variant.checkoutTemplate)) return;
    if (!variant.apiGameName || !variant.apiPackId) return;

    // Build a map of user inputs by label for easy lookup
    const inputMap = {};
    for (const input of order.userInputs) {
        inputMap[input.label] = input.value;
    }

    const webhookUrl = process.env.APP_BASE_URL
        ? `${process.env.APP_BASE_URL}/api/webhooks/gamers-workshop`
        : undefined;

    let externalResult;

    if (variant.checkoutTemplate === "uid_topup") {
        externalResult = await gwService.placeGameOrder({
            game: variant.apiGameName,
            pack: variant.apiPackId,
            uid: inputMap["Player UID"] || "",
            zoneId: inputMap["Zone/Server"] || inputMap["Zone ID"] || inputMap["Server"] || undefined,
            server: inputMap["Zone/Server"] || inputMap["Zone ID"] || inputMap["Server"] || undefined,
            webhookUrl,
        });
    } else if (variant.checkoutTemplate === "gift_cards") {
        externalResult = await gwService.placeGiftcardOrder({
            platform: variant.apiGameName,
            denomination: variant.apiPackId,
            quantity: order.quantity || 1,
            webhookUrl,
        });
    }

    if (externalResult) {
        order.externalOrder = {
            provider: "gamers_workshop",
            externalOrderId: externalResult.data?.orderId || externalResult.orderId,
            externalStatus: "processing",
            placedAt: new Date(),
            rawResponse: externalResult,
        };
        order.orderStatus = "processing";
        order.tracking.push({
            status: "processing",
            message: "Order placed with fulfillment provider",
        });
        await order.save();
    }
}
