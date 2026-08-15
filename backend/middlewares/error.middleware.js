import { CurrencyError } from "../utils/currencyConverter.js";

export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // A currency with no configured rate is a configuration problem, not a server
    // fault — surface it as 422 with a machine-readable code so clients can tell the
    // difference between "we are broken" and "this product is priced in a currency
    // the admin has not set up".
    if (err instanceof CurrencyError) {
        return res.status(err.status).json({
            success: false,
            code: err.code,
            currency: err.currency,
            message: err.message,
        });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
