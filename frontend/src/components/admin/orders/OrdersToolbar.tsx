"use client";

import AdminToolbar from "@/components/admin/shared/AdminToolbar";
import React from "react";

interface Props {
    actions?: React.ReactNode;
}

export default function OrdersToolbar({ actions }: Props) {
    return (
        <AdminToolbar
            title="Order Management"
            actions={actions}
        />
    );
}
