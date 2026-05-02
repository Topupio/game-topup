export const PAYPAL_MIN_ORDER_USD = 5;
export const PAYPAL_PROCESSING_RATE = 0.09;

export function roundCurrency(amount) {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculatePayPalBreakdown(subtotalUsd) {
    const roundedSubtotalUsd = roundCurrency(subtotalUsd);
    const isEligible = roundedSubtotalUsd > PAYPAL_MIN_ORDER_USD;
    const processingFeeUsd = isEligible
        ? roundCurrency(roundedSubtotalUsd * PAYPAL_PROCESSING_RATE)
        : 0;
    const totalUsd = roundCurrency(roundedSubtotalUsd + processingFeeUsd);

    return {
        isEligible,
        subtotalUsd: roundedSubtotalUsd,
        processingFeeUsd,
        totalUsd,
        rate: PAYPAL_PROCESSING_RATE,
        minOrderUsd: PAYPAL_MIN_ORDER_USD,
    };
}
