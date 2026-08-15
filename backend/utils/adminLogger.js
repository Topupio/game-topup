import AdminActivityLog from "../models/adminLog.model.js";

/**
 * Logs administrative activity to the database.
 * Designed as a "fire-and-forget" utility to avoid blocking the main thread.
 * 
 * @param {Object} req - Express request object (used to extract admin info, IP, and user-agent)
 * @param {Object} data - Log data
 * @param {string} data.action - The action performed (e.g., "CREATE", "UPDATE", "DELETE")
 * @param {string} data.module - The module name (must match enum in adminLog.model.js)
 * @param {string} [data.targetId] - ID of the entity affected
 * @param {string} [data.targetModel] - Name of the model affected (e.g., "Game", "Product")
 * @param {Object} [data.changes] - Object containing old and new values
 * @param {string} [data.description] - Human-readable description of the action
 */
export const logAdminActivity = (req, data) => {
    try {
        // Guard against the single-object call form, e.g. logAdminActivity({ req, action }).
        // That shape silently wrote nothing: `req` became the options object (no .headers)
        // and `data` was undefined. Fail loudly instead of losing the audit trail.
        if (!data || typeof data !== "object") {
            console.error(
                "[AdminLogger] Invalid call: expected logAdminActivity(req, data). " +
                "Received a single argument — no log was written."
            );
            return;
        }

        const { action, module, targetId, targetModel, changes, description } = data;

        // Extract IP address from request
        // Handles standard req.ip and common proxy headers
        const ip = req.headers['x-forwarded-for']?.split(',')[0]
            || req.ip
            || req.socket.remoteAddress;

        // Perform creation in background
        AdminActivityLog.create({
            admin: data.admin || req.user?.id,
            action,
            module,
            targetId,
            targetModel,
            changes,
            description,
            ip,
            userAgent: req.headers['user-agent']
        }).catch(err => {
            // Silently log failure to console to prevent system-wide crashes
            console.error(`[AdminLogger] Failed to save activity log: ${err.message}`);
        });

    } catch (err) {
        console.error(`[AdminLogger] Error in logging utility: ${err.message}`);
    }
};
