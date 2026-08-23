const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parse(iso?: string) {
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats in UTC on purpose: server and browser timezones differ, and toLocaleString()
 * renders differently in each, which React flags as a hydration mismatch. Callers should
 * still add suppressHydrationWarning, same as DeliveryCard does.
 */
export function formatDateTime(iso?: string): string | null {
    const d = parse(iso);
    if (!d) return null;

    const date = `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    return `${date}, ${time}`;
}

/** Gap between two timestamps, e.g. "3 min" or "1 h 12 min". */
export function formatDuration(fromIso?: string, toIso?: string): string | null {
    const from = parse(fromIso);
    const to = parse(toIso);
    if (!from || !to) return null;

    const minutes = Math.round((to.getTime() - from.getTime()) / 60000);
    if (minutes < 0) return null;
    if (minutes < 1) return "under a minute";
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        const rest = minutes % 60;
        return rest ? `${hours} h ${rest} min` : `${hours} h`;
    }

    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day" : `${days} days`;
}

/** Groups a 12-digit UTR into "4273 9182 0394". */
export function groupUtr(utr: string): string {
    return utr.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}
