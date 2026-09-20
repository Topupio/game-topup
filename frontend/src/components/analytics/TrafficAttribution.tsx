"use client";

import { useEffect } from "react";
import { captureSessionAttribution } from "@/lib/analytics/purchase";

export default function TrafficAttribution() {
  useEffect(() => {
    captureSessionAttribution();
  }, []);
  return null;
}
