"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo/logo-nobg.png";
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
    RiArrowRightSLine
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import Drawer from "./Drawer";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-border"
                    : "bg-white/60 backdrop-blur-md border-b border-transparent"
            }`}
        >
            {/* DESKTOP NAVBAR */}
            <div className="hidden lg:flex max-w-7xl mx-auto px-6 h-16 items-center justify-between gap-8">

                {/* Left: Logo + Nav links */}
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition">
                        <Image src={logo} alt="Logo" className="h-10 w-auto" />
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
            <div className="lg:hidden h-14 px-4 flex items-center justify-between">

                {/* LEFT: Menu + Search */}
                <div className="flex items-center gap-3 text-foreground">
                    <button
                        onClick={() => setOpen(!open)}
                        className="p-1.5 rounded-lg hover:bg-muted transition"
                    >
                        {open ? <RiCloseLine size={24} /> : <RiMenu2Line size={24} />}
                    </button>

                    <Link href="/search" className="p-1.5 rounded-lg hover:bg-muted transition">
                        <RiSearchLine size={22} />
                    </Link>
                </div>

                {/* CENTER: Logo */}
                <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                    <Image src={logo} alt="Logo" className="h-9 w-auto object-contain" />
                </Link>

                {/* RIGHT: Language & Account */}
                <div className="flex items-center gap-2 text-foreground">
                    <LangCurrencySelector hideLabelOnMobile />

                    <Link
                        href={user ? "/account" : "/login"}
                        className="p-1.5 rounded-lg hover:bg-muted transition"
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
                    ? "text-secondary bg-secondary/5"
                    : "text-muted-foreground hover:text-secondary-foreground hover:bg-muted"
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

    const [selectedLang, setSelectedLang] = useState("English");
    const [selectedCurrency, setSelectedCurrency] = useState("USD");

    const [mounted, setMounted] = useState(false);
    if (!mounted && typeof window !== "undefined") {
        setMounted(true);
    }

    const languages = ["English", "Russian", "Arabic", "Bengali"];
    const currencies = ["USD", "INR", "RUB", "AED", "BDT"];

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
                                            onClick={() => setSelectedCurrency(cur)}
                                            className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
                                                selectedCurrency === cur
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
                                Prices shown in {selectedCurrency}
                            </p>

                            <button
                                onClick={() => setIsShowing(false)}
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
                onClick={() => setIsShowing(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-secondary/30 hover:bg-muted/50 transition"
            >
                <RiGlobalLine size={16} className="text-secondary" />
                <span className={hideLabelOnMobile ? "hidden sm:inline" : "inline"}>
                    {selectedLang} · {selectedCurrency}
                </span>
            </button>

            {mounted && createPortal(modal, document.body)}
        </>
    );
}
