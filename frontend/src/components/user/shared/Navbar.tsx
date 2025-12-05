"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo/logo-nobg.png";

import {
    RiMenu2Line ,
    RiCloseLine,
    RiSearchLine,
    RiUserLine,
} from "react-icons/ri";

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
                    <NavLink href="/blog" label="Blog" />

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
                        {open ? <RiCloseLine size={26} /> : <RiMenu2Line  size={26} />}
                    </button>

                    <button>
                        <RiSearchLine size={24} />
                    </button>
                </div>

                {/* CENTER — LOGO */}
                <Link href="/" className="flex justify-center">
                    <Image src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                </Link>

                {/* RIGHT — LANGUAGE & ACCOUNT */}
                <div className="flex items-center gap-4 text-white">
                    <button className="text-sm flex items-center gap-1">🌐 EN</button>

                    <Link href={user ? "/account" : "/login"}>
                        <RiUserLine size={24} />
                    </Link>
                </div>
            </div>

            {/* MOBILE DROPDOWN MENU */}
            {open && (
                <div className="lg:hidden bg-black/80 backdrop-blur-2xl border-t border-white/10 p-6 space-y-6">

                    <MobileLink href="/" label="Home" />
                    <MobileLink href="/categories" label="Games" />
                    <MobileLink href="/blog" label="Blog" />
                </div>
            )}
        </nav>
    );
}

/* ----------------------------------- */
/* DESKTOP SEARCH BOX */
/* ----------------------------------- */
function SearchBoxDesktop() {
    return (
        <div className="relative w-56">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
                type="text"
                placeholder="Search games..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-secondary transition"
            />
        </div>
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
function MobileLink({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="block py-2 text-lg text-gray-300 hover:text-white transition">
            {label}
        </Link>
    );
}

/* ----------------------------------- */
/* DESKTOP DROPDOWN */
/* ----------------------------------- */
function LangCurrencySelector() {
    return (
        <div className="relative group">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:border-secondary hover:text-white transition">
                🌐 EN • USD
            </button>

            <div className="absolute hidden group-hover:block right-0 top-12 bg-black/90 backdrop-blur-xl p-4 w-44 rounded-xl border border-white/10 shadow-xl">
                <DropdownButtons />
            </div>
        </div>
    );
}

function DropdownButtons() {
    return (
        <>
            <button className="text-left text-gray-300 hover:text-white transition">🇺🇸 English • USD</button>
            <button className="text-left text-gray-300 hover:text-white transition">🇮🇳 English • INR</button>
            <button className="text-left text-gray-300 hover:text-white transition">🇦🇪 Arabic • AED</button>
        </>
    );
}
