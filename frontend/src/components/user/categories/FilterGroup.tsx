"use client";

import { ReactNode } from "react";

interface FilterGroupProps {
    title: string;
    children: ReactNode;
}

export default function FilterGroup({ title, children }: FilterGroupProps) {
    return (
        <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3">
                {title}
            </h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
}
