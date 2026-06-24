import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as gwService from "../services/gamersWorkshop.service.js";
import Order from "../models/order.model.js";

/**
 * @desc    Verify a player's UID via Gamers Workshop API
 * @route   POST /api/games/verify-player
 * @access  Private
 */
export const verifyPlayer = asyncHandler(async (req, res) => {
    const { uid, zoneId, server, game } = req.body;

    if (!uid || typeof uid !== "string" || uid.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "A valid UID is required (minimum 3 characters)",
        });
    }

    const result = await gwService.verifyPlayer(uid.trim(), zoneId, server, game);

    // Upstream returns fields at top level (ML: username/region/...), but some
    // endpoints/unsupported games nest under `data`. Normalize both shapes.
    const src = result.data && typeof result.data === "object" ? result.data : result;

    res.status(200).json({
        success: true,
        data: {
            username: src.username ?? src.player?.username ?? null,
            region: src.region ?? src.regionDetails?.displayName ?? null,
            regionCode: src.regionCode ?? src.regionDetails?.code ?? null,
            uid: src.user_id ?? src.uid ?? uid.trim(),
            zoneId: src.zone_id ?? src.zoneId ?? zoneId ?? null,
            verified: src.verified ?? Boolean(src.username ?? src.player?.username),
            unsupported: src.unsupported ?? false,
        },
        _debug: result, // TEMP: PUBG shape — remove after
    });
});

/**
 * @desc    Handle Gamers Workshop webhook for order status updates
 * @route   POST /api/webhooks/gamers-workshop
 * @access  Public
 */
export const handleWebhook = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(200).json({ received: true, message: "Missing orderId or status" });
        }

        const order = await Order.findOne({
            "externalOrder.externalOrderId": orderId,
        });

        if (!order) {
            return res.status(200).json({ received: true, message: "Order not found" });
        }

        // Map external status to internal orderStatus
        const statusMap = {
            processing: "processing",
            done: "completed",
            cancelled: "cancelled",
            failed: "failed",
        };

        const newStatus = statusMap[status];
        if (newStatus && order.orderStatus !== newStatus) {
            order.externalOrder.externalStatus = status;
            order.externalOrder.lastCheckedAt = new Date();
            order.orderStatus = newStatus;
            order.tracking.push({
                status: newStatus,
                message: `Fulfillment update: ${status}`,
            });
            await order.save();
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Gamers Workshop webhook error:", error);
        res.status(200).json({ received: true });
    }
};
