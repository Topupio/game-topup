"use client";

import { useCallback } from "react";
import { useGoogleReCaptcha } from "@google-recaptcha/react";

export function useRecaptcha() {
    const googleReCaptcha = useGoogleReCaptcha();

    const getRecaptchaToken = useCallback(
        async (action: string): Promise<string | null> => {
            if (!googleReCaptcha?.executeV3) {
                console.warn(
                    `[reCAPTCHA] executeV3 not available for action "${action}". Proceeding without token.`
                );
                return null;
            }

            try {
                return await googleReCaptcha.executeV3(action);
            } catch (error) {
                console.error(`[reCAPTCHA] Failed to execute for action "${action}":`, error);
                return null;
            }
        },
        [googleReCaptcha]
    );

    return {
        getRecaptchaToken,
        isRecaptchaLoading: googleReCaptcha?.isLoading ?? true,
    };
}
