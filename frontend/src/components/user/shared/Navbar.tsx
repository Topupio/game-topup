"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
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
    RiFacebookFill
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import Drawer from "./Drawer";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">

            {/* DESKTOP NAVBAR */}
            <div className="hidden lg:flex max-w-7xl mx-auto px-4 lg:px-0 h-16 items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center hover:opacity-80 transition">
                    <Image src={logo} alt="Logo" className="h-12 w-auto" />
                </Link>

                <div className="flex items-center gap-10">
                    <NavLink href="/" label="Home" />
                    <NavLink href="/categories" label="Games" />
                    <NavLink href="/blogs" label="Blog" />

                    <SearchBoxDesktop />
                    <LangCurrencySelector />

                    {user ? (
                        <Link
                            href="/account"
                            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/20 text-white hover:border-secondary hover:bg-white/10 transition"
                        >
                            <RiUserLine size={18} /> Account
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-2 border border-white/20 rounded-xl text-white hover:border-white hover:bg-white/10 transition"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* MOBILE TOP BAR */}
            <div className="lg:hidden h-16 px-4 flex items-center justify-between">

                {/* LEFT — MENU + SEARCH */}
                <div className="flex items-center gap-4 text-white">
                    <button onClick={() => setOpen(!open)}>
                        {open ? <RiCloseLine size={26} /> : <RiMenu2Line size={26} />}
                    </button>

                    <Link href="/search">
                        <RiSearchLine size={24} />
                    </Link>
                </div>

                {/* CENTER — LOGO */}
                <Link href="/" className="flex justify-center">
                    <Image src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                </Link>

                {/* RIGHT — LANGUAGE & ACCOUNT */}
                <div className="flex items-center gap-4 text-white">
                    <LangCurrencySelector hideLabelOnMobile />

                    <Link href={user ? "/account" : "/login"}>
                        <RiUserLine size={24} />
                    </Link>
                </div>
            </div>

            {/* MOBILE DRAWER MENU */}
            <Drawer
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Menu"
            >
                <div className="space-y-4">
                    <div className="space-y-1">
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

                    <div className="p-6 border-t border-white/5 space-y-4">
                        {user ? (
                            <Link
                                href="/account"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-white"
                            >
                                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                                    {user.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold truncate max-w-[120px]">{user.name}</p>
                                    <p className="text-[10px] text-gray-400">View Profile</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium text-center hover:bg-white/10 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setOpen(false)}
                                    className="px-6 py-3 rounded-xl bg-secondary text-black text-sm font-bold text-center hover:opacity-90 transition"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center justify-center gap-6 pt-4 text-gray-500">
                            <RiDiscordFill size={20} className="hover:text-white transition-colors cursor-pointer" />
                            <RiTwitterXFill size={18} className="hover:text-white transition-colors cursor-pointer" />
                            <RiInstagramLine size={20} className="hover:text-white transition-colors cursor-pointer" />
                            <RiFacebookFill size={20} className="hover:text-white transition-colors cursor-pointer" />
                        </div>
                    </div>
                </div>
            </Drawer>
        </nav>
    );
}

/* ----------------------------------- */
/* DESKTOP NAV LINK */
/* ----------------------------------- */
function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="relative text-white font-medium group"
        >
            {label}
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-white group-hover:w-full transition-all"></span>
        </Link>
    );
}

/* ----------------------------------- */
/* MOBILE NAV LINK */
/* ----------------------------------- */
function MobileLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-4 py-3 px-4 rounded-2xl text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group active:scale-95"
        >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-secondary group-hover:bg-secondary/10 transition-colors">
                {icon}
            </div>
            {label}
        </Link>
    );
}

/* ----------------------------------- */
/* LANGUAGE & CURRENCY SELECTOR */
/* ----------------------------------- */
function LangCurrencySelector({ hideLabelOnMobile = false }) {
    const [isShowing, setIsShowing] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [selectedLang, setSelectedLang] = useState("English");
    const [selectedCurrency, setSelectedCurrency] = useState("USD");

    useEffect(() => setMounted(true), []);

    const languages = ["English", "Russian", "Arabic", "Bengali"];
    const currencies = ["USD", "INR", "RUB", "AED", "BDT"];

    const modal = (
        <AnimatePresence>
            {isShowing && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsShowing(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-primary border border-white/10 rounded-3xl p-8 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Preferences</h2>
                                <p className="text-sm text-gray-400">
                                    Choose your language and currency
                                </p>
                            </div>
                            <button
                                onClick={() => setIsShowing(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                            >
                                <RiCloseLine size={24} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Language */}
                            <div>
                                <h3 className="text-sm text-gray-400 mb-3">Language</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {languages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLang(lang)}
                                            className={`p-4 rounded-xl border text-sm transition
                        ${selectedLang === lang
                                                    ? "bg-secondary/10 border-secondary text-white"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Currency */}
                            <div>
                                <h3 className="text-sm text-gray-400 mb-3">Currency</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {currencies.map(cur => (
                                        <button
                                            key={cur}
                                            onClick={() => setSelectedCurrency(cur)}
                                            className={`p-3 rounded-xl border text-sm transition
                        ${selectedCurrency === cur
                                                    ? "bg-secondary/10 border-secondary text-white"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                                                }`}
                                        >
                                            {cur}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest">
                                Prices will be shown in {selectedCurrency}
                            </p>

                            <button
                                onClick={() => setIsShowing(false)}
                                className="px-5 py-2 bg-secondary text-black rounded-lg text-sm font-medium hover:opacity-90"
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
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:border-secondary hover:text-white transition group"
            >
                <RiGlobalLine size={18} className="text-secondary" />
                <span className={hideLabelOnMobile ? "hidden sm:inline" : "inline"}>
                    {selectedLang} • {selectedCurrency}
                </span>
            </button>

            {mounted && createPortal(modal, document.body)}
        </>
    );
}
