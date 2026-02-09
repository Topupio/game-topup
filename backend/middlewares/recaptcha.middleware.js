const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SCORE_THRESHOLD = 0.5;

export function verifyRecaptcha(expectedAction) {
    return async (req, res, next) => {
        // Skip verification if no secret key configured (dev without reCAPTCHA)
        if (!RECAPTCHA_SECRET_KEY) {
            return next();
        }

        const { recaptchaToken } = req.body;

        // Allow requests without token in development for graceful degradation
        if (!recaptchaToken) {
            if (process.env.NODE_ENV !== "production") {
                return next();
            }
            return res.status(403).json({
                success: false,
                message: "reCAPTCHA verification required",
            });
        }

        try {
            const response = await fetch(VERIFY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                    remoteip: req.ip || "",
                }),
            });

            const data = await response.json();
            console.log("[reCAPTCHA] Google response:", JSON.stringify(data));

            if (!data.success) {
                return res.status(403).json({
                    success: false,
                    message: "reCAPTCHA verification failed",
                });
            }

            // Only check action if Google returned one (v3 keys only)
            if (expectedAction && data.action && data.action !== expectedAction) {
                return res.status(403).json({
                    success: false,
                    message: "reCAPTCHA action mismatch",
                });
            }

            if (typeof data.score === "number" && data.score < SCORE_THRESHOLD) {
                return res.status(403).json({
                    success: false,
                    message: "Request blocked due to suspicious activity",
                });
            }

            next();
        } catch (error) {
            console.error("[reCAPTCHA] Verification error:", error);
            // Allow through on verification service failure to avoid blocking legitimate users
            if (process.env.NODE_ENV !== "production") {
                return next();
            }
            return res.status(500).json({
                success: false,
                message: "reCAPTCHA verification service unavailable",
            });
        }
    };
}
