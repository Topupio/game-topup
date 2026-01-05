import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { logAdminActivity } from "../utils/adminLogger.js";

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { gameId, productId, qty, userInputs } = req.body;

        // Basic validations
        if (!gameId || !productId || !qty || !Array.isArray(userInputs)) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        if (qty <= 0 || !Number.isInteger(qty)) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        // Validate user inputs early
        for (const input of userInputs) {
            if (!input.label || typeof input.value === "undefined") {
                return res.status(400).json({
                    success: false,
                    message: "Each input must contain label and value"
                });
            }
        }

        const sanitizedInputs = userInputs.map(input => ({
            label: input.label,
            value: input.value
        }));

        // Now hit the DB
        const product = await Product.findOne({ _id: productId, gameId });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found for this game" });
        }

        const unitPrice = product.discountedPrice ?? product.price;
        const amount = unitPrice * qty;

        let order;
        for (let i = 0; i < 3; i++) {
            try {
                const timestamp = Date.now().toString().slice(-6);
                const random = Math.random().toString(36).substring(2, 5).toUpperCase();
                const orderId = `ORD-${timestamp}-${random}`;

                order = await Order.create({
                    orderId,
                    user: req.user.id,
                    game: gameId,
                    product: productId,
                    amount,
                    userInputs: sanitizedInputs,
                    productSnapshot: {
                        name: product.name,
                        price: product.price,
                        discountedPrice: product.discountedPrice,
                        deliveryTime: product.deliveryTime || "24-48 Hours",
                    },
                    tracking: [{
                        status: "pending",
                        message: "Order placed successfully. Awaiting payment/verification."
                    }]
                });
                break;
            } catch (err) {
                if (err.code !== 11000) throw err;
            }
        }

        if (!order) {
            return res.status(500).json({ success: false, message: "Failed to generate unique order ID" });
        }

        res.status(201).json({
            success: true,
            data: order,
            message: "Order created successfully"
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: req.user.id })
                .populate("game", "name imageUrl")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Order.countDocuments({ user: req.user.id })
        ]);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error("Get My Orders Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc    Get order details
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderDetails = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid order id" });
        }

        const query = req.user.role === "admin"
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };

        const order = await Order.findOne(query)
            .populate("game", "name imageUrl")
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not authorized"
            });
        }

        res.status(200).json({ success: true, data: order });

    } catch (error) {
        console.error("Get Order Details Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private/Admin
 */
export const adminGetOrders = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access only" });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const { status, search } = req.query;
        const query = {};

        const allowedStatuses = ["pending", "paid", "processing", "completed", "cancelled", "failed"];
        if (status && allowedStatuses.includes(status)) {
            query.orderStatus = status;
        }

        if (search && search.length <= 50) {
            const regex = new RegExp(search, "i");
            query.$or = [
                { orderId: regex },
                { "userInputs.value": regex }
            ];
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate("user", "name email")
                .populate("game", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Order.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error("Admin Get Orders Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PATCH /api/orders/admin/:id
 * @access  Private/Admin
 */
export const adminUpdateOrder = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access only" });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid order id" });
        }

        const { orderStatus, paymentStatus, adminNote, completionProof } = req.body;

        const allowedOrderStatuses = ["pending", "paid", "processing", "completed", "cancelled", "failed"];
        const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

        if (orderStatus && !allowedOrderStatuses.includes(orderStatus)) {
            return res.status(400).json({ success: false, message: "Invalid order status" });
        }

        if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
            return res.status(400).json({ success: false, message: "Invalid payment status" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const oldStatus = order.orderStatus;
        let isModified = false;

        if (orderStatus && orderStatus !== order.orderStatus) {
            order.orderStatus = orderStatus;
            isModified = true;
        }

        if (paymentStatus && paymentStatus !== order.paymentStatus) {
            order.paymentStatus = paymentStatus;
            isModified = true;
        }

        if (adminNote && adminNote !== order.adminNote) {
            order.adminNote = adminNote;
            isModified = true;
        }

        if (completionProof && completionProof !== order.completionProof) {
            order.completionProof = completionProof;
            isModified = true;
        }

        if (!isModified) {
            return res.status(400).json({ success: false, message: "No changes detected" });
        }

        if (orderStatus && orderStatus !== oldStatus) {
            order.tracking.push({
                status: orderStatus,
                message: `Order status updated to ${orderStatus}` + (adminNote ? `: ${adminNote}` : "")
            });
        }

        await order.save();

        await logAdminActivity({
            req,
            action: "UPDATE",
            module: "ORDER",
            targetId: order._id,
            targetModel: "Order",
            description: `Updated order ${order.orderId} status from ${oldStatus} to ${order.orderStatus}`,
            changes: { oldStatus, newStatus: order.orderStatus }
        });

        res.status(200).json({ success: true, data: order, message: "Order updated successfully" });

    } catch (error) {
        console.error("Admin Update Order Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
