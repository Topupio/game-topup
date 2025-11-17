"use client";
import { useState } from "react";
import Link from "next/link";
import { navOptions } from "@/data/navOptions";

// React Icons
import { RiMenu3Line, RiCloseLine, RiShoppingCartLine, RiUserLine } from "react-icons/ri";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-lg">
            {/* Desktop Navbar */}
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="text-xl font-semibold text-primary tracking-wide">
                    <span className="text-secondary">Game</span>Store
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center space-x-8 font-medium">
                    {navOptions.map((option) => (
                        <NavItem key={option.name} href={option.path} label={option.name} />
                    ))}

                    {/* Cart */}
                    <Link href="/cart" className="relative">
                        <RiShoppingCartLine className="w-6 h-6 text-white hover:text-primary transition" />
                        <span className="absolute -top-1 -right-2 bg-primary text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                            2
                        </span>
                    </Link>

                    {/* Profile */}
                    <Link href="/profile">
                        <RiUserLine className="w-6 h-6 text-white hover:text-primary transition" />
                    </Link>

                    {/* Login Button */}
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-xl bg-primary text-black font-semibold hover:bg-secondary transition"
                    >
                        Login
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setOpen(!open)}
                    className="lg:hidden text-white"
                >
                    {open ? <RiCloseLine size={28} /> : <RiMenu3Line size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="lg:hidden bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 space-y-4 animate-fadeIn">
                    {navOptions.map((option) => (
                        <MobileItem key={option.name} href={option.path} label={option.name} />
                    ))}

                    <Link
                        href="/login"
                        className="block w-full text-center py-3 rounded-xl bg-primary text-black hover:bg-secondary transition"
                    >
                        Login / Signup
                    </Link>
                </div>
            )}
        </nav>
    );
}

/* Reusable Nav Item */
function NavItem({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="text-white hover:text-primary transition relative group"
        >
            {label}
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );
}

/* Mobile Nav Item */
function MobileItem({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="block text-white text-lg font-medium hover:text-primary transition"
        >
            {label}
        </Link>
    );
}
