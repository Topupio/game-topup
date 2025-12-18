import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken.model.js";

export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "15m",
    });
};

export const generateVerifyToken = () => {
    const token = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    return {
        token,      // send to user
        hashed,     // store in DB
        expires: Date.now() + 15 * 60 * 1000 // 15 mins
    };
};

// Generate a random refresh token value
export const generateRefreshTokenValue = () => crypto.randomBytes(48).toString("hex");

// Create a new refresh token
export const createRefreshToken = async (userId, ip) => {
    const value = generateRefreshTokenValue();
    const ttl = parseExpiry(process.env.REFRESH_EXPIRE) ?? 7 * 24 * 60 * 60 * 1000;
    const doc = await RefreshToken.create({
        user: userId,
        token: value,
        expires: new Date(Date.now() + ttl),
        createdByIp: ip,
    });
    return { value, doc };
};

// Set authentication cookies
export const setAuthCookies = (res, accessToken, refreshTokenValue) => {
    const isProd = process.env.NODE_ENV === "production";
    const accessMaxAge = parseExpiry(process.env.JWT_EXPIRE) ?? 15 * 60 * 1000;
    const refreshMaxAge = parseExpiry(process.env.REFRESH_EXPIRE) ?? 7 * 24 * 60 * 60 * 1000;

    res.cookie("token", accessToken, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        maxAge: accessMaxAge,
    });

    res.cookie("rt", refreshTokenValue, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        maxAge: refreshMaxAge,
    });
};

// Send authentication pair
export const sendAuthPair = async (user, statusCode, res, ip) => {
    const access = generateAccessToken(user._id);
    const { value: refresh } = await createRefreshToken(user._id, ip);
    setAuthCookies(res, access, refresh);
    res.status(statusCode).json({
        success: true,
        token: access,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// Rotate refresh token
export const rotateRefreshToken = async (currentTokenValue, ip) => {
    const existing = await RefreshToken.findOne({ token: currentTokenValue });
    if (!existing || !existing.isActive) return null;
    existing.revoked = new Date();
    existing.revokedByIp = ip;
    const { value: newValue, doc: newDoc } = await createRefreshToken(existing.user, ip);
    existing.replacedByToken = newValue;
    await existing.save();
    return { newValue, newDoc, userId: existing.user };
};

// Revoke refresh token
export const revokeRefreshToken = async (currentTokenValue, ip) => {
    const existing = await RefreshToken.findOne({ token: currentTokenValue });
    if (!existing || !existing.isActive) return false;
    existing.revoked = new Date();
    existing.revokedByIp = ip;
    await existing.save();
    return true;
};

// Parse expiry time
export const parseExpiry = (exp) => {
    if (!exp) return null;
    if (/^\d+d$/.test(exp)) return parseInt(exp) * 24 * 60 * 60 * 1000;
    if (/^\d+h$/.test(exp)) return parseInt(exp) * 60 * 60 * 1000;
    if (/^\d+m$/.test(exp)) return parseInt(exp) * 60 * 1000;
    if (/^\d+s$/.test(exp)) return parseInt(exp) * 1000;
    return null;
};