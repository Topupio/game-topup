export const PAYPAL_MIN_ORDER_USD = 5;
export const PAYPAL_PROCESSING_RATE = 0.09;

export function roundCurrency(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function convertToUsd(
    amount: number,
    currency: string,
    rates: Record<string, number>
): number {
    if (currency === "USD") return amount;
    const fromRate = rates[currency] || 1;
    return amount / fromRate;
}

export function convertFromUsd(
    amount: number,
    currency: string,
    rates: Record<string, number>
): number {
    if (currency === "USD") return amount;
    const toRate = rates[currency] || 1;
    return amount * toRate;
}

export function getPayPalFeeBreakdown(
    subtotal: number,
    currency: string,
    rates: Record<string, number>
) {
    const subtotalUsd = roundCurrency(convertToUsd(subtotal, currency, rates));
    const isEligible = subtotalUsd > PAYPAL_MIN_ORDER_USD;
    const processingFeeUsd = isEligible
        ? roundCurrency(subtotalUsd * PAYPAL_PROCESSING_RATE)
        : 0;
    const totalUsd = roundCurrency(subtotalUsd + processingFeeUsd);
    const processingFee = roundCurrency(
        convertFromUsd(processingFeeUsd, currency, rates)
    );
    const total = roundCurrency(subtotal + processingFee);

    return {
        isEligible,
        subtotalUsd,
        processingFee,
        processingFeeUsd,
        total,
        totalUsd,
        rate: PAYPAL_PROCESSING_RATE,
        minOrderUsd: PAYPAL_MIN_ORDER_USD,
    };
}
