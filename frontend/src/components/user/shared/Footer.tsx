"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-linear-to-b from-slate-950 to-slate-900 text-white py-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                {/* Logo + Description */}
                <div>
                    <h2 className="text-2xl font-bold mb-3">YourBrand</h2>
                    <p className="text-sm opacity-80">
                        Making gaming better with smooth UI, fast performance,
                        and beautiful experiences.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                    <ul className="space-y-2 text-sm opacity-90">
                        <li><Link href="/" className="hover:text-cyan-400">Home</Link></li>
                        <li><Link href="/games" className="hover:text-cyan-400">Games</Link></li>
                        <li><Link href="/tournaments" className="hover:text-cyan-400">Tournaments</Link></li>
                        <li><Link href="/contact" className="hover:text-cyan-400">Contact</Link></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Support</h3>
                    <ul className="space-y-2 text-sm opacity-90">
                        <li><Link href="/faq" className="hover:text-cyan-400">FAQ</Link></li>
                        <li><Link href="/help" className="hover:text-cyan-400">Help Center</Link></li>
                        <li><Link href="/report" className="hover:text-cyan-400">Report Issue</Link></li>
                        <li><Link href="/privacy" className="hover:text-cyan-400">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Social */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                    <div className="flex gap-4 text-xl">
                        <Link href="#" className="hover:text-cyan-400">🌐</Link>
                        <Link href="#" className="hover:text-cyan-400">🐦</Link>
                        <Link href="#" className="hover:text-cyan-400">📸</Link>
                        <Link href="#" className="hover:text-cyan-400">🎮</Link>
                    </div>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/20 mt-10 pt-4 text-center text-sm opacity-70">
                © {new Date().getFullYear()} YourBrand. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;