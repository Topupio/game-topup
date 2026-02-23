"use client";

import React from "react";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export default function AdminCard({ children, className = "" }: Props) {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
