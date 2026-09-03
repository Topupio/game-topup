/** Official Topupio WhatsApp number, digits only (wa.me format). */
export const SUPPORT_WHATSAPP = "919497110191";

/** Same number, formatted for display. */
export const SUPPORT_WHATSAPP_DISPLAY = "+91 94971 10191";

/** Community links customers can join for deals and drops. */
export const WHATSAPP_CHANNEL_URL = "https://chat.whatsapp.com/DyCMwqukV0SLSytqBVIpIc";
export const TELEGRAM_CHANNEL_URL = "https://t.me/RealTopupio_bot";

/** wa.me link, optionally with a prefilled message. */
export function whatsappLink(message?: string) {
    const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
