/** Official Topupio WhatsApp number, digits only (wa.me format). */
export const SUPPORT_WHATSAPP = "919497110191";

/** Same number, formatted for display. */
export const SUPPORT_WHATSAPP_DISPLAY = "+91 94971 10191";

/** Official broadcast channels customers can follow for deals and drops. */
export const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb7CBGAFy72AfSNfYm1Z";
export const TELEGRAM_CHANNEL_URL = "https://t.me/gametopupsofficial";

/** wa.me link, optionally with a prefilled message. */
export function whatsappLink(message?: string) {
    const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
