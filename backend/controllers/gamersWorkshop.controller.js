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

    res.status(200).json({
        success: true,
        data: result.data,
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
