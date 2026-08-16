"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { formatFixed, convertMoney } from "@/lib/utils/money";
import { RiInformationLine } from "react-icons/ri";

/**
 * A wallet balance, shown in the user's display currency.
 *
 * Used everywhere a wallet figure appears so the disclosure below cannot be dropped
 * from one surface by accident.
 *
 * The wallet is held in INR. Someone browsing in USD sees a converted figure, and
 * because exchange rates are set by an admin rather than a live feed, that figure can
 * change without any transaction. The tooltip says so; in INR there is nothing to
 * disclose and it is hidden.
 */
export default function WalletAmount({
    balancePaise,
    className = "",
    showHint = true,
}: {
    balancePaise: number;
    className?: string;
    showHint?: boolean;
}) {
    const { currency, rates } = useCurrency();

    const inr = (Number(balancePaise) || 0) / 100;
    const isInr = currency === "INR";

    if (isInr) {
        return <span className={className}>{formatFixed(inr, "INR")}</span>;
    }

    const converted = convertMoney(inr, "INR", currency, rates);

    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
            <span>≈ {formatFixed(converted, currency)}</span>
            {showHint && (
                <span
                    title={`Your wallet is held in Indian Rupees (${formatFixed(inr, "INR")}). This is today's approximate value in ${currency}.`}
                    className="text-gray-400 cursor-help"
                    aria-label="Wallet is held in Indian Rupees"
                >
                    <RiInformationLine className="text-sm" />
                </span>
            )}
        </span>
    );
}
