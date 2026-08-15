import mongoose from "mongoose";
import Game from "../models/game.model.js";
import { getExchangeRates } from "./currencyConverter.js";

/**
 * Warn about any currency used in product pricing that has no configured exchange rate.
 *
 * convertAmount() throws on an unknown currency rather than silently converting at 1:1,
 * so an unconfigured currency turns every checkout for that product into a 422. Surfacing
 * it at boot makes that a deploy-time signal instead of a customer-facing failure.
 */
export async function checkCurrencyConfiguration() {
    try {
        const rates = await getExchangeRates();

        const used = await Game.distinct("variants.regionPricing.currency");
        const missing = used
            .filter(Boolean)
            .map((c) => String(c).toUpperCase())
            .filter((c) => !Number.isFinite(rates[c]) || rates[c] <= 0);

        if (missing.length > 0) {
            console.warn(
                `[STARTUP] No exchange rate configured for: ${[...new Set(missing)].join(", ")}. ` +
                `Checkout will fail with 422 for products priced in these currencies. ` +
                `Configure them in Admin → Settings → Exchange Rates.`
            );
        }

        return { missing };
    } catch (err) {
        console.error("[STARTUP] Currency configuration check failed:", err.message);
        return { missing: [] };
    }
}

/**
 * Assert the MongoDB deployment supports multi-document transactions.
 *
 * The wallet ledger writes the balance update and its ledger row inside one transaction.
 * On a standalone mongod that throws IllegalOperation at the first top-up — far better to
 * fail at boot with an actionable message than at the first customer payment.
 */
export function checkTransactionSupport() {
    const topologyType = mongoose.connection?.client?.topology?.description?.type;

    // Unknown means the driver has not finished describing the topology yet; treat a
    // definite "Single" as the only failing case rather than guessing.
    const supportsTransactions = topologyType !== "Single";

    if (!supportsTransactions) {
        console.error(
            "[STARTUP] MongoDB is running as a standalone instance, which does not support " +
            "multi-document transactions. The wallet ledger requires a replica set " +
            "(MongoDB Atlas provides one by default). Wallet operations will fail until this is fixed."
        );
    }

    return { topologyType, supportsTransactions };
}

export async function runStartupChecks() {
    checkTransactionSupport();
    await checkCurrencyConfiguration();
}
