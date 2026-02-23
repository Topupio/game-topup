import ExchangeRate from "../models/exchangeRate.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { logAdminActivity } from "../utils/adminLogger.js";

const FALLBACK_RATES = {
    INR: 96,
    PHP: 56,
    BRL: 5,
    IDR: 15500,
};

/**
 * @desc    Get all exchange rates (public)
 * @route   GET /api/exchange-rates
 * @access  Public
 */
export const getAllRates = asyncHandler(async (req, res) => {
    const dbRates = await ExchangeRate.find({}).sort({ targetCurrency: 1 }).lean();

    // Merge fallbacks with DB values (DB takes precedence)
    const ratesMap = { ...FALLBACK_RATES };
    for (const r of dbRates) {
        ratesMap[r.targetCurrency] = r.rate;
    }

    // Build response array
    const data = Object.entries(ratesMap).map(([currency, rate]) => {
        const dbEntry = dbRates.find((r) => r.targetCurrency === currency);
        return {
            _id: dbEntry?._id || null,
            baseCurrency: "USD",
            targetCurrency: currency,
            rate,
            updatedAt: dbEntry?.updatedAt || null,
            isDefault: !dbEntry,
        };
    });

    res.status(200).json({
        success: true,
        baseCurrency: "USD",
        data,
    });
});

/**
 * @desc    Bulk upsert exchange rates (admin)
 * @route   PUT /api/exchange-rates
 * @access  Admin
 */
export const bulkUpdateRates = asyncHandler(async (req, res) => {
    const { rates } = req.body;

    if (!Array.isArray(rates) || rates.length === 0) {
        return res.status(400).json({ success: false, message: "Rates array is required" });
    }

    for (const r of rates) {
        if (!r.targetCurrency || typeof r.rate !== "number" || r.rate < 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid rate entry: ${JSON.stringify(r)}`,
            });
        }
    }

    const ops = rates.map((r) => ({
        updateOne: {
            filter: { targetCurrency: r.targetCurrency.toUpperCase().trim() },
            update: {
                $set: {
                    baseCurrency: "USD",
                    targetCurrency: r.targetCurrency.toUpperCase().trim(),
                    rate: r.rate,
                    updatedBy: req.user.id,
                },
            },
            upsert: true,
        },
    }));

    await ExchangeRate.bulkWrite(ops);

    await logAdminActivity({
        req,
        action: "UPDATE",
        module: "settings",
        description: `Updated ${rates.length} exchange rate(s)`,
        changes: { rates },
    });

    // Return updated list
    const updated = await ExchangeRate.find({}).sort({ targetCurrency: 1 }).lean();

    res.status(200).json({
        success: true,
        data: updated,
        message: "Exchange rates updated successfully",
    });
});

/**
 * @desc    Delete an exchange rate (admin)
 * @route   DELETE /api/exchange-rates/:id
 * @access  Admin
 */
export const deleteRate = asyncHandler(async (req, res) => {
    const rate = await ExchangeRate.findById(req.params.id);

    if (!rate) {
        return res.status(404).json({ success: false, message: "Exchange rate not found" });
    }

    await rate.deleteOne();

    await logAdminActivity({
        req,
        action: "DELETE",
        module: "settings",
        targetId: rate._id,
        targetModel: "ExchangeRate",
        description: `Deleted exchange rate for ${rate.targetCurrency}`,
    });

    res.status(200).json({
        success: true,
        message: `Exchange rate for ${rate.targetCurrency} deleted`,
    });
});
