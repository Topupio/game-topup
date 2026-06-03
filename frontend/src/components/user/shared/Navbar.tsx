"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES } from "@/lib/constants/currencies";
import { ordersApiClient } from "@/services/orders/ordersApi.client";
import { AdminOrderMessage } from "@/services/orders/types";
import logo from "@/assets/logo/logo.png";
import SearchBoxDesktop from "./SearchBoxDesktop";

import {
    RiMenu2Line,
    RiCloseLine,
    RiSearchLine,
    RiUserLine,
    RiGlobalLine,
    RiHome4Line,
    RiGamepadLine,
    RiArticleLine,
    RiDiscordFill,
    RiTwitterXFill,
    RiInstagramLine,
    RiFacebookFill,
    RiArrowRightSLine,
    RiNotification3Line,
    RiCheckboxCircleLine
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import Drawer from "./Drawer";

export default function Navbar() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [adminMessageState, setAdminMessageState] = useState<{
        userId: string;
        messages: AdminOrderMessage[];
    }>({ userId: "", messages: [] });
    const { user } = useAuth();
    const adminMessages = adminMessageState.userId === user?.id ? adminMessageState.messages : [];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!user) return;

        const controller = new AbortController();

        const loadMessages = () => {
            ordersApiClient
                .getMyAdminMessages(5, controller.signal)
                .then((res) => {
                    setAdminMessageState({ userId: user.id, messages: res.data });
                })
                .catch(() => {
                    // Admin messages are helpful, but the navbar should not fail if polling fails.
                });
        };

        loadMessages();
        const intervalId = window.setInterval(loadMessages, ADMIN_MESSAGE_POLL_INTERVAL);

        return () => {
            controller.abort();
            window.clearInterval(intervalId);
        };
    }, [user]);

    const handleAdminMessageClick = async (message: AdminOrderMessage) => {
        if (!user) return;

        const readAt = new Date().toISOString();
        setAdminMessageState((current) => ({
            userId: user.id,
            messages: current.messages.map((item) =>
                item._id === message._id
                    ? { ...item, isRead: true, adminNoteReadAt: readAt }
                    : item
            ),
        }));

        try {
            const res = await ordersApiClient.markAdminMessageRead(message._id);
            setAdminMessageState((current) => ({
                userId: user.id,
                messages: current.messages.map((item) =>
                    item._id === message._id ? res.data : item
                ),
            }));
        } catch {
            // Navigation still helps the user see the message; the next poll can retry state.
        } finally {
            router.push(`/orders/${message._id}#admin-message`);
        }
    };

    const handleClearAdminMessages = async () => {
        if (!user) return;

        const previousMessages = adminMessages;
        setAdminMessageState({ userId: user.id, messages: [] });

        try {
            await ordersApiClient.clearAdminMessages();
        } catch {
            setAdminMessageState({ userId: user.id, messages: previousMessages });
        }
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 p-[2px] transition-all duration-300 ${
                scrolled
                    ? "bg-slate-900/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-slate-700/50"
                    : "bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50"
            }`}
        >
            {/* DESKTOP NAVBAR */}
            <div className="hidden lg:flex  mx-auto px-6 h-16 items-center justify-between gap-8">

                {/* Left: Logo + Nav links */}
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center hover:opacity-80 transition">
                        <Image src={logo} alt="Logo" className="h-36 mt-2 w-auto" />
                    </Link>

                    <div className="flex items-center gap-1">
                        <NavLink href="/" label="Home" />
                        <NavLink href="/categories" label="Games" />
                        <NavLink href="/blogs" label="Blog" />
                    </div>
                </div>

                {/* Right: Search + Lang + Account */}
                <div className="flex items-center gap-3">
                    <SearchBoxDesktop />
                    <LangCurrencySelector />
                    {user && (
                        <AdminMessageBell
                            messages={adminMessages}
                            onNotificationClick={handleAdminMessageClick}
                            onClearNotifications={handleClearAdminMessages}
                        />
                    )}

                    {user ? (
                        <Link
                            href="/account"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition shadow-sm"
                        >
                            <RiUserLine size={16} />
                            Account
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition shadow-sm"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            {/* MOBILE TOP BAR */}
            <div className="lg:hidden h-14 px-.5 flex items-center justify-between">

                {/* LEFT: Menu + Search */}
                <div className="flex items-center gap-3 text-white">
                    <button
                        onClick={() => setOpen(!open)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 transition"
                    >
                        {open ? <RiCloseLine size={24} /> : <RiMenu2Line size={24} />}
                    </button>

                    <Link href="/search" className="p-1.5 rounded-lg hover:bg-slate-800 transition">
                        <RiSearchLine size={22} />
                    </Link>
                </div>

                {/* CENTER: Logo */}
                <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                    <Image src={logo} alt="Logo" className="h-28 w-auto object-contain" />
                </Link>

                {/* RIGHT: Language & Account */}
                <div className="flex items-center gap-2 text-white">
                    {user && (
                        <AdminMessageBell
                            messages={adminMessages}
                            onNotificationClick={handleAdminMessageClick}
                            onClearNotifications={handleClearAdminMessages}
                            compact
                        />
                    )}
                    <LangCurrencySelector hideLabelOnMobile />

                    <Link
                        href={user ? "/account" : "/login"}
                        className="p-1.5 rounded-lg hover:bg-slate-800 transition"
                    >
                        <RiUserLine size={22} />
                    </Link>
                </div>
            </div>

            {/* MOBILE DRAWER */}
            <Drawer
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Menu"
            >
                <div className="space-y-2">
                    <div className="space-y-1 px-3">
                        <MobileLink
                            href="/"
                            label="Home"
                            icon={<RiHome4Line size={20} />}
                            onClick={() => setOpen(false)}
                        />
                        <MobileLink
                            href="/categories"
                            label="Games"
                            icon={<RiGamepadLine size={20} />}
                            onClick={() => setOpen(false)}
                        />
                        <MobileLink
                            href="/blogs"
                            label="Blog"
                            icon={<RiArticleLine size={20} />}
                            onClick={() => setOpen(false)}
                        />
                    </div>

                    <div className="mx-3 my-4 border-t border-border" />

                    <div className="px-3 space-y-3">
                        {user ? (
                            <Link
                                href="/account"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/10 text-foreground hover:bg-secondary/10 transition"
                            >
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                                    {user.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">View Profile</p>
                                </div>
                                <RiArrowRightSLine size={18} className="text-muted-foreground" />
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium text-center hover:bg-muted transition"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2.5 rounded-lg bg-secondary text-white text-sm font-semibold text-center hover:bg-secondary/90 transition"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center justify-center gap-5 pt-3 text-muted-foreground">
                            <RiDiscordFill size={20} className="hover:text-secondary transition-colors cursor-pointer" />
                            <RiTwitterXFill size={18} className="hover:text-secondary transition-colors cursor-pointer" />
                            <RiInstagramLine size={20} className="hover:text-secondary transition-colors cursor-pointer" />
                            <RiFacebookFill size={20} className="hover:text-secondary transition-colors cursor-pointer" />
                        </div>
                    </div>
                </div>
            </Drawer>
        </nav>
    );
}

const ADMIN_MESSAGE_POLL_INTERVAL = 1 * 60 * 1000;

function AdminMessageBell({
    messages,
    compact = false,
    onNotificationClick,
    onClearNotifications,
}: {
    messages: AdminOrderMessage[];
    compact?: boolean;
    onNotificationClick: (message: AdminOrderMessage) => void;
    onClearNotifications: () => void;
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        window.addEventListener("pointerdown", handlePointerDown);
        return () => window.removeEventListener("pointerdown", handlePointerDown);
    }, [open]);

    const unreadCount = messages.filter((message) => !message.isRead).length;
    const countLabel = unreadCount > 9 ? "9+" : String(unreadCount);

    const handleItemClick = (message: AdminOrderMessage) => {
        setOpen(false);
        onNotificationClick(message);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label="View admin message notifications"
                aria-expanded={open}
                className={`relative inline-flex items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-secondary/50 hover:bg-slate-800/50 hover:text-white ${
                    compact ? "h-9 w-9" : "h-10 w-10"
                }`}
            >
                <RiNotification3Line size={compact ? 20 : 18} className="text-secondary" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-slate-900">
                        {countLabel}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className={`z-[70] overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] ${
                            compact
                                ? "fixed right-2 top-16 w-[calc(100vw-1rem)] max-w-sm"
                                : "absolute right-0 top-full mt-3 w-96 max-w-[calc(100vw-2rem)]"
                        }`}
                    >
                        <div className="flex items-center justify-between border-b border-border bg-muted/70 px-4 py-3">
                            <div>
                                <p className="text-sm font-bold text-foreground">Notifications</p>
                                <p className="text-xs text-muted-foreground">
                                    {messages.length === 0
                                        ? "No admin messages"
                                        : unreadCount > 0
                                            ? `${unreadCount} unread admin message${unreadCount === 1 ? "" : "s"}`
                                            : "All admin messages read"}
                                </p>
                            </div>
                            <RiNotification3Line className="text-secondary" size={20} />
                        </div>

                        <div className="max-h-[22rem] overflow-y-auto p-2">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <RiCheckboxCircleLine size={22} />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">
                                        No notifications
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Admin messages you receive will appear here.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                const label = message.gameName
                                    ? `${message.productName} · ${message.gameName}`
                                    : message.productName;

                                return (
                                    <button
                                        key={message._id}
                                        type="button"
                                        onClick={() => handleItemClick(message)}
                                        className={`w-full rounded-xl border p-3 text-left transition ${
                                            message.isRead
                                                ? "border-transparent bg-white hover:border-border hover:bg-muted/60"
                                                : "border-secondary/25 bg-secondary/5 shadow-[0_0_22px_rgba(99,102,241,0.12)] hover:bg-secondary/10"
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                message.isRead ? "bg-muted text-muted-foreground" : "bg-secondary text-white"
                                            }`}>
                                                {message.isRead ? (
                                                    <RiCheckboxCircleLine size={18} />
                                                ) : (
                                                    <RiNotification3Line size={18} />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold leading-snug text-foreground">
                                                        You have received a message from the admin
                                                    </p>
                                                    {!message.isRead && (
                                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-danger" />
                                                    )}
                                                </div>
                                                <p className="truncate text-xs font-medium text-secondary">
                                                    {message.orderId} · {label}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                    {message.adminNote}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                                })
                            )}
                        </div>

                        {messages.length > 0 && (
                            <div className="border-t border-border bg-white px-4 py-3">
                            <button
                                type="button"
                                onClick={() => {
                                    onClearNotifications();
                                }}
                                className="w-full rounded-lg px-3 py-2 text-center text-sm font-semibold text-secondary transition hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                            >
                                Clear notifications
                            </button>
                        </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ----------------------------------- */
/* DESKTOP NAV LINK                    */
/* ----------------------------------- */
function NavLink({ href, label }: { href: string; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`relative px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                    ? "text-secondary bg-secondary/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
        >
            {label}
        </Link>
    );
}

/* ----------------------------------- */
/* MOBILE NAV LINK                     */
/* ----------------------------------- */
function MobileLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition active:scale-[0.98] ${
                isActive
                    ? "text-secondary bg-secondary/5"
                    : "text-foreground hover:bg-muted"
            }`}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                isActive
                    ? "bg-secondary/10 text-secondary"
                    : "bg-muted text-muted-foreground"
            }`}>
                {icon}
            </div>
            {label}
        </Link>
    );
}

/* ----------------------------------- */
/* LANGUAGE & CURRENCY SELECTOR        */
/* ----------------------------------- */
function LangCurrencySelector({ hideLabelOnMobile = false }) {
    const [isShowing, setIsShowing] = useState(false);
    const { currency, setCurrency } = useCurrency();

    const [selectedLang, setSelectedLang] = useState("English");
    const [tempCurrency, setTempCurrency] = useState(currency);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => setMounted(true), 0);
        return () => window.clearTimeout(timeoutId);
    }, []);

    const languages = ["English", "Russian", "Arabic", "Bengali"];
    const currencies = CURRENCIES.map((c) => c.code);

    const modal = (
        <AnimatePresence>
            {isShowing && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsShowing(false)}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-lg bg-white border border-border rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Preferences</h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose your language and currency
                                </p>
                            </div>
                            <button
                                onClick={() => setIsShowing(false)}
                                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                            >
                                <RiCloseLine size={22} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Language */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Language</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLang(lang)}
                                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
                                                selectedLang === lang
                                                    ? "bg-secondary/10 border-secondary text-secondary"
                                                    : "bg-muted/50 border-border text-muted-foreground hover:border-secondary/30 hover:text-foreground"
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Currency */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Currency</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {currencies.map(cur => (
                                        <button
                                            key={cur}
                                            onClick={() => setTempCurrency(cur)}
                                            className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
                                                tempCurrency === cur
                                                    ? "bg-secondary/10 border-secondary text-secondary"
                                                    : "bg-muted/50 border-border text-muted-foreground hover:border-secondary/30 hover:text-foreground"
                                            }`}
                                        >
                                            {cur}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                                Prices shown in {tempCurrency}
                            </p>

                            <button
                                onClick={() => { setCurrency(tempCurrency); setIsShowing(false); }}
                                className="px-5 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition"
                            >
                                Apply
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => { setTempCurrency(currency); setIsShowing(true); }}
                className={`flex items-center gap-2 rounded-lg border border-slate-700 text-sm text-slate-300 transition hover:border-secondary/50 hover:bg-slate-800/50 hover:text-white ${
                    hideLabelOnMobile ? "h-9 w-9 justify-center p-0 sm:w-auto sm:px-3 sm:py-2" : "px-3 py-2"
                }`}
            >
                <RiGlobalLine size={16} className="text-secondary" />
                <span className={hideLabelOnMobile ? "hidden sm:inline" : "inline"} suppressHydrationWarning>
                    {mounted ? `${selectedLang} · ${currency}` : "English · INR"}
                </span>
            </button>

            {mounted && createPortal(modal, document.body)}
        </>
    );
}
