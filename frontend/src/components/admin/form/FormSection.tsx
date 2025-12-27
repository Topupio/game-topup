"use client";

import { ReactNode } from "react";

interface FormSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    divider?: boolean;
}

export default function FormSection({
    title,
    description,
    children,
    divider = true,
}: FormSectionProps) {
    return (
        <>
            {divider && <hr className="border-gray-200" />}
            <div className="space-y-4">
                {title && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                )}
                <div className="space-y-4">{children}</div>
            </div>
        </>
    );
}
