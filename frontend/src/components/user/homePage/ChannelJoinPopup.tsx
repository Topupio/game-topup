"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLine, RiWhatsappFill, RiTelegram2Fill, RiArrowRightSLine } from "react-icons/ri";
import { WHATSAPP_CHANNEL_URL, TELEGRAM_CHANNEL_URL } from "@/lib/constants/support";
import { isAnyModalOpen } from "@/lib/utils/modalPresence";

const STORAGE_KEY = "channel_popup_last_shown";
const SHOW_DELAY_MS = 2500;

/** Local calendar day, so the popup shows at most once per day per browser. */
const today = () => new Date().toLocaleDateString("en-CA");

const PERKS = [
    { icon: "🎉", title: "Giveaways", note: "Every week" },
    { icon: "⚡", title: "Flash deals", note: "You first" },
    { icon: "🔑", title: "Login top-ups", note: "Channel only" },
];

const CHANNELS = [
    {
        href: WHATSAPP_CHANNEL_URL,
        Icon: RiWhatsappFill,
        title: "Join WhatsApp Channel",
        note: "Deals straight to your chats",
        className: "bg-gradient-to-r from-[#25d366] to-[#12b555] shadow-[0_10px_24px_-12px_rgba(37,211,102,0.8)]",
    },
    {
        href: TELEGRAM_CHANNEL_URL,
        Icon: RiTelegram2Fill,
        title: "Join Telegram Channel",
        note: "Codes & login top-up posts",
        className: "bg-gradient-to-r from-[#29a9eb] to-[#1d8fd1] shadow-[0_10px_24px_-12px_rgba(41,169,235,0.8)]",
    },
];

export default function ChannelJoinPopup() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let lastShown: string | null = null;
        try {
            lastShown = window.localStorage.getItem(STORAGE_KEY);
        } catch {
            // Private mode or blocked storage: fall through and show it.
        }
        if (lastShown === today()) return;

        const timer = window.setTimeout(() => {
            // The review prompt is the more important ask; don't stack on top of it.
            if (isAnyModalOpen()) return;
            setOpen(true);
        }, SHOW_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, []);

    const dismiss = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, today());
        } catch {
            // Nothing to do — worst case it shows again next load.
        }
        setOpen(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-[3px]"
                        onClick={dismiss}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="channel-popup-title"
                        className="fixed z-[61] inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md
                                   overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 26, stiffness: 260 }}
                    >
                        <button
                            onClick={dismiss}
                            aria-label="Close"
                            className="absolute top-3.5 right-3.5 z-10 grid h-8 w-8 place-items-center rounded-full
                                       border border-white/30 bg-white/20 text-white transition-colors hover:bg-white/30"
                        >
                            <RiCloseLine className="text-lg" />
                        </button>

                        {/* Header */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 px-5 pt-5 pb-10 text-white">
                            <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,0.45),transparent_70%)]" />
                            <span className="relative inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wide">
                                🎁 MEMBERS ONLY
                            </span>
                            <h2 id="channel-popup-title" className="relative mt-2.5 text-lg sm:text-2xl font-bold leading-tight tracking-tight">
                                Join Topupio &amp;{" "}
                                <span className="bg-gradient-to-r from-green-400 to-cyan-300 bg-clip-text text-transparent">
                                    unlock exclusive deals
                                </span>
                            </h2>
                            <p className="relative mt-1.5 text-xs sm:text-sm text-slate-300">
                                Giveaways, flash deals and login top-up drops land in our channels first.
                            </p>
                        </div>

                        {/* Body */}
                        <div className="relative -mt-6 px-4 pb-4">
                            <div className="mb-3 flex gap-2">
                                {PERKS.map((perk) => (
                                    <div
                                        key={perk.title}
                                        className="flex-1 rounded-xl border border-gray-200 bg-white p-2.5 text-center shadow-[0_10px_24px_-14px_rgba(15,23,42,0.3)]"
                                    >
                                        <div className="text-lg">{perk.icon}</div>
                                        <b className="mt-1 block text-[11px] font-semibold text-gray-900">{perk.title}</b>
                                        <span className="text-[9px] text-gray-500">{perk.note}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2.5">
                                {CHANNELS.map(({ href, Icon, title, note, className }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={dismiss}
                                        className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-white ${className}`}
                                    >
                                        <span className="pointer-events-none absolute inset-y-0 -left-[60%] w-2/5 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/35 to-transparent motion-safe:animate-[shine_3.2s_ease-in-out_infinite]" />
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20 text-lg">
                                            <Icon />
                                        </span>
                                        <span className="min-w-0 flex-1 text-left">
                                            <b className="block text-[13.5px] font-bold">{title}</b>
                                            <span className="block text-[10px] opacity-90">{note}</span>
                                        </span>
                                        <RiArrowRightSLine className="shrink-0 text-xl transition-transform group-hover:translate-x-0.5" />
                                    </a>
                                ))}
                            </div>

                            <button
                                onClick={dismiss}
                                className="mx-auto mt-3 block text-[11px] font-semibold text-gray-500 underline"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
