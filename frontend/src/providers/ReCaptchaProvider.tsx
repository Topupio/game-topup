"use client";

import type { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "@google-recaptcha/react";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function ReCaptchaProvider({ children }: { children: ReactNode }) {
    if (!siteKey) {
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider type="v3" siteKey={siteKey}>
            {children}
        </GoogleReCaptchaProvider>
    );
}
