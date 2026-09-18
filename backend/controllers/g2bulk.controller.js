// G2Bulk is used only for player-name checks; order fulfilment remains unchanged.
const API_BASE = "https://api.g2bulk.com/v1";
const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_FRESH_MS = 15 * 60 * 1000;
const CACHE_STALE_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 5_000;
const MAX_RATE_BUCKETS = 10_000;

const GAME_CONFIGS = [
  { slug: "8-ball-pool-top-up", code: "8_ball_pool" },
  { slug: "afk-journey", code: "afkjourney" },
  { slug: "arena-breakout-top-up", code: "arena_breakout", aliases: ["arenabreakout"] },
  { slug: "blood-strike-gold-top-up", code: "bloodstrike" },
  { slug: "buy-bigo-live-diamonds", code: "bigo" },
  { slug: "delta-force", code: "deltaforce" },
  { slug: "farlight-84", code: "farlight84" },
  { slug: "free-fire-cis", code: "freefire_cis" },
  { slug: "free-fire-latam", code: "freefire_latam" },
  { slug: "genshin-impact-genesis-crystals-in-india", code: "genshin", requiresServer: true },
  { slug: "honkai-impact-3-sea", code: "honkai_impact" },
  { slug: "honkai-star-rail-top-up", code: "honkai_star_rail", requiresServer: true, aliases: ["honkai"] },
  { slug: "honor-of-kings-tokens-top-up", code: "hok", aliases: ["honorofkings"] },
  { slug: "identity-v", code: "identityv", requiresServer: true },
  { slug: "love-and-deepspace-crystal-top-up", code: "lds", requiresServer: true, aliases: ["loveanddeepsp", "loveanddeepspace"] },
  { slug: "magic-chess-go-go-top-up", code: "magic_chess_gogo", requiresServer: true },
  { slug: "marvel-rivals", code: "marvelrivals" },
  { slug: "mlbb-diamond-recharge-india", code: "mlbb", requiresServer: true },
  { slug: "mlbb-top-up-ph", code: "mlbb", requiresServer: true },
  { slug: "mobile-legends-russia", code: "mlbb_ru", requiresServer: true },
  { slug: "nikke-top-up", code: "nikke", requiresServer: true },
  { slug: "pubg-mobile-uc-global", code: "pubgm", aliases: ["pubg"] },
  { slug: "punishing-gray-raven-uid-top-up", code: "pgr", requiresServer: true },
  { slug: "sword-of-justice-mobile-sea", code: "swordofjustice", requiresServer: true, defaultServer: "SouthEast Asia" },
  { slug: "top-up-poppo-live-coins", code: "poppolive" },
  { slug: "where-winds-meet", code: "wwm", aliases: ["wherewindmeet"] },
  { slug: "wuthering-waves-top-up-india", code: "wuwa", requiresServer: true },
  { slug: "zenless-zone-zero-top-up", code: "zzz", requiresServer: true, aliases: ["zenless"] },
];

const gameLookup = new Map();
for (const config of GAME_CONFIGS) {
  for (const key of [config.slug, config.code, ...(config.aliases || [])]) gameLookup.set(key.toLowerCase(), config);
}

const rateBuckets = new Map();
const verificationCache = new Map();
const inFlight = new Map();
let authBlocked = false;

const clean = (value, max = 100) =>
  typeof value === "string" && value.trim().length <= max ? value.trim() : "";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pruneMaps(now) {
  for (const [key, entry] of rateBuckets) if (entry.until <= now) rateBuckets.delete(key);
  for (const [key, entry] of verificationCache) {
    if (now - entry.savedAt > CACHE_STALE_MS) verificationCache.delete(key);
  }
  while (verificationCache.size > MAX_CACHE_ENTRIES) verificationCache.delete(verificationCache.keys().next().value);
}

function consumeRateLimit(req, now) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (rateBuckets.size >= MAX_RATE_BUCKETS && !rateBuckets.has(ip)) return false;
  const bucket = rateBuckets.get(ip) || { count: 0, until: now + 60_000 };
  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  return bucket.count <= 30;
}

export function normalizeServer(game, value) {
  const raw = clean(value);
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases = game === "wuwa"
    ? { asia: "os_asia", sea: "os_sea", southeastasia: "os_sea", europe: "os_euro", america: "os_usa", northamerica: "os_usa", twhkmo: "os_cht" }
    : game === "nikke"
      ? { global: "Global", jp: "JP", kr: "KR", sea: "SEA", america: "NA", na: "NA" }
      : game === "identityv"
        ? { asia: "Asia", naeu: "NA and EU", naandeu: "NA and EU" }
        : { asia: "Asia", america: "America", europe: "Europe", twhkmo: "TW_HK_MO" };
  return aliases[key] || raw;
}

async function requestVerification(payload) {
  const apiKey = process.env.G2BULK_API_KEY;
  if (!apiKey) {
    const error = new Error("G2BULK_API_KEY is not configured");
    error.code = "CONFIG";
    throw error;
  }
  if (authBlocked) {
    const error = new Error("G2Bulk authentication is blocked until backend restart");
    error.code = "AUTH_BLOCKED";
    throw error;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}/games/checkPlayerId`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const raw = await response.text();
      if (response.status === 401 || response.status === 403) {
        authBlocked = true;
        const error = new Error("G2Bulk rejected access; check API credentials and permissions");
        error.code = "AUTH";
        throw error;
      }
      let result = {};
      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        const error = new Error(`G2Bulk returned non-JSON HTTP ${response.status}`);
        error.code = "BAD_RESPONSE";
        throw error;
      }

      if (response.status === 401) {
        // G2Bulk permanently bans repeated bad authentication attempts. Stop all
        // further auth requests until an operator updates the key and restarts.
        authBlocked = true;
        const error = new Error("G2Bulk rejected the configured API key");
        error.code = "AUTH";
        throw error;
      }
      if ((response.status === 429 || response.status >= 500) && attempt === 0) {
        await delay(500);
        continue;
      }
      if (!response.ok) {
        const error = new Error(`G2Bulk returned HTTP ${response.status}`);
        error.code = response.status === 400 && result.valid === "invalid" ? "INVALID" : "UPSTREAM";
        error.status = response.status;
        throw error;
      }
      if (!["valid", "invalid"].includes(result.valid) || (result.valid === "valid" && !(typeof result.name === "string" && result.name.trim()))) {
        const error = new Error("G2Bulk returned an unrecognized verification response");
        error.code = "BAD_RESPONSE";
        throw error;
      }
      return result;
    } catch (error) {
      if (attempt === 0 && (error.name === "TimeoutError" || error.name === "AbortError" || error.code === "BAD_RESPONSE")) {
        await delay(500);
        continue;
      }
      throw error;
    }
  }
}

function responseData({ userId, zone, username, verified, cached = false }) {
  return { success: true, data: { uid: userId, username: verified ? username : null, verified, zoneId: zone || null, cached } };
}

export async function verifyPlayer(req, res) {
  res.set("Cache-Control", "no-store");
  const now = Date.now();
  pruneMaps(now);
  if (!consumeRateLimit(req, now)) {
    return res.status(429).json({ success: false, message: "Please wait before checking again." });
  }

  const { uid, zoneId, game } = req.body || {};
  const userId = clean(uid, 80);
  const gameKey = clean(game, 120).toLowerCase();
  const config = gameLookup.get(gameKey);
  if (!config) return res.json({ success: true, data: { verified: false, unsupported: true } });

  const zone = clean(zoneId) || config.defaultServer || "";
  if (!/^[A-Za-z0-9._-]{4,80}$/.test(userId) || (config.requiresServer && !zone)) {
    return res.status(400).json({ success: false, message: "Enter a valid Player ID and required Server ID." });
  }

  const normalizedZone = config.requiresServer ? normalizeServer(config.code, zone) : "";
  const cacheKey = `${config.code}|${userId.toLowerCase()}|${normalizedZone.toLowerCase()}`;
  const cached = verificationCache.get(cacheKey);
  if (cached && now - cached.savedAt <= CACHE_FRESH_MS) {
    return res.json(responseData({ userId, zone, username: cached.username, verified: cached.verified, cached: true }));
  }

  const payload = { game: config.code, user_id: userId, ...(config.requiresServer ? { server_id: normalizedZone } : {}) };
  try {
    let request = inFlight.get(cacheKey);
    if (!request) {
      request = requestVerification(payload).finally(() => inFlight.delete(cacheKey));
      inFlight.set(cacheKey, request);
    }
    const result = await request;
    const verified = result.valid === "valid" && typeof result.name === "string" && result.name.trim().length > 0;
    const username = verified ? result.name.trim().slice(0, 150) : null;
    verificationCache.set(cacheKey, { username, verified, savedAt: now });
    return res.json(responseData({ userId, zone, username, verified }));
  } catch (error) {
    if (error.code === "INVALID") {
      verificationCache.set(cacheKey, { username: null, verified: false, savedAt: now });
      return res.json(responseData({ userId, zone, username: null, verified: false }));
    }
    console.error("[PLAYER-VERIFY] G2Bulk failure", {
      game: config.code,
      code: error.code || "UNKNOWN",
      status: error.status || null,
      message: error.message,
    });
    if (cached && now - cached.savedAt <= CACHE_STALE_MS) {
      return res.json(responseData({ userId, zone, username: cached.username, verified: cached.verified, cached: true }));
    }
    return res.status(503).json({ success: false, message: "Name lookup is temporarily unavailable. Please try again shortly." });
  }
}

export async function verificationHealth(_req, res) {
  const apiKey = process.env.G2BULK_API_KEY;
  if (!apiKey || authBlocked) {
    return res.status(503).json({ success: false, provider: "g2bulk", configured: Boolean(apiKey), authBlocked });
  }
  try {
    const response = await fetch(`${API_BASE}/getMe`, {
      headers: { "X-API-Key": apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => ({}));
    const healthy = response.ok && (body.success === true || body.authenticated === true || body.status === 200);
    return res.status(healthy ? 200 : 503).json({
      success: healthy,
      provider: "g2bulk",
      configured: true,
      supportedGameRoutes: GAME_CONFIGS.length,
    });
  } catch (error) {
    return res.status(503).json({ success: false, provider: "g2bulk", configured: true, message: error.message });
  }
}
