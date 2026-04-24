/**
 * Gamers Workshop API Service
 * External API for topupio fulfillment and player verification.
 * Base URL: https://api.sonofutred.uk/api/v1
 */

let _baseUrl = null;
let _apiKey = null;

function getConfig() {
    if (!_baseUrl) {
        _baseUrl = (process.env.GAMERS_WORKSHOP_API_URL || "https://api.sonofutred.uk/api/v1").replace(/\/$/, "");
        _apiKey = process.env.GAMERS_WORKSHOP_API_KEY;
        if (!_apiKey) {
            throw new Error("GAMERS_WORKSHOP_API_KEY environment variable is not configured");
        }
    }
    return { baseUrl: _baseUrl, apiKey: _apiKey };
}

async function apiRequest(method, path, body = null) {
    const { baseUrl, apiKey } = getConfig();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
        },
        signal: controller.signal,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${baseUrl}${path}`, options);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.error || data.message || `API error: ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error("Gamers Workshop API request timed out");
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Verify a player's UID and retrieve their player name.
 * Routes to the correct endpoint based on the game.
 *  - PUBG Mobile → POST /player/verify
 *  - Mobile Legends → POST /ml/check-region
 */
export async function verifyPlayer(uid, zoneId, server, game) {
    const gameLower = (game || "").toLowerCase();

    // Mobile Legends uses a different endpoint
    if (gameLower.includes("mobile-legends") || gameLower === "ml") {
        return checkMlRegion(uid, zoneId);
    }

    // PUBG Mobile
    if (gameLower.includes("pubg")) {
        const body = { uid };
        if (zoneId) body.zoneId = zoneId;
        if (server) body.server = server;
        return apiRequest("POST", "/player/verify", body);
    }

    // Unsupported game — return not-verifiable so frontend can skip
    return { data: { verified: false, unsupported: true } };
}

/**
 * Check a Mobile Legends player's region.
 * POST /ml/check-region
 */
export async function checkMlRegion(userId, zoneId) {
    const body = { userId, zoneId };
    return apiRequest("POST", "/ml/check-region", body);
}

/**
 * Place a game topupio order.
 * POST /orders/game
 */
export async function placeGameOrder({ game, pack, uid, zoneId, server, webhookUrl }) {
    const body = { game, pack, uid };
    if (zoneId) body.zoneId = zoneId;
    if (server) body.server = server;
    if (webhookUrl) body.webhookUrl = webhookUrl;

    return apiRequest("POST", "/orders/game", body);
}

/**
 * Place a gift card order.
 * POST /orders/giftcard
 * Uses platform + denomination + quantity pattern.
 */
export async function placeGiftcardOrder({ platform, denomination, quantity, webhookUrl }) {
    const body = { platform, denomination, quantity: quantity || 1 };
    if (webhookUrl) body.webhookUrl = webhookUrl;

    return apiRequest("POST", "/orders/giftcard", body);
}

/**
 * Get account balance.
 * GET /balance
 */
export async function getBalance() {
    return apiRequest("GET", "/balance");
}

/**
 * Get the status of an external order.
 * GET /orders/:orderId
 */
export async function getOrderStatus(externalOrderId) {
    return apiRequest("GET", `/orders/${externalOrderId}`);
}
