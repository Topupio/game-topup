"use client";

import React from "react";

type Props = {
    title: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
};

export default function AdminToolbar({ title, actions, className = "mb-6" }: Props) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
            <div>{actions}</div>
        </div>
    );
}
