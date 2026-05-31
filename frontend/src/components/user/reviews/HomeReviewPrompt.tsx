"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { Order } from "@/services/orders/types";
import ReviewModal from "./ReviewModal";

const getDismissKey = (orderId: string) => `review_prompt_dismissed_${orderId}`;

export default function HomeReviewPrompt() {
    const { user, loading } = useAuth();
    const [eligibleOrder, setEligibleOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (loading || !user) return;

        const controller = new AbortController();

        ordersApiClient.getRecentReviewEligibleOrder(controller.signal)
            .then((res) => {
                const order = res.data?.order;
                if (!order) return;
                const dismissed = window.localStorage.getItem(getDismissKey(order._id));
                if (!dismissed) {
                    setEligibleOrder(order);
                }
            })
            .catch(() => {
                // Do not interrupt the homepage if the prompt check fails.
            });

        return () => controller.abort();
    }, [loading, user]);

    const handleClose = () => {
        if (eligibleOrder) {
            window.localStorage.setItem(getDismissKey(eligibleOrder._id), "1");
        }
        setEligibleOrder(null);
    };

    const handleSuccess = () => {
        if (eligibleOrder) {
            window.localStorage.setItem(getDismissKey(eligibleOrder._id), "1");
        }
        setEligibleOrder(null);
    };

    if (!eligibleOrder) return null;

    return (
        <ReviewModal
            isOpen={!!eligibleOrder}
            onClose={handleClose}
            order={eligibleOrder}
            onSuccess={handleSuccess}
        />
    );
}
