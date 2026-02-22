"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo/logo-2.png";
import {
    RiFacebookFill,
    RiTwitterXFill,
    RiInstagramLine,
    RiDiscordFill,
    RiMailLine,
    RiMapPinLine,
    RiPhoneLine
} from "react-icons/ri";

const Footer = () => {
    return (
        <footer className="relative bg-slate-900 border-t border-slate-700/50 pt-16 pb-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Brand Section */}
                    <div className="space-y-5">
                        <Link href="/" className="inline-block hover:opacity-80 transition">
                            <Image src={logo} alt="Logo" className="h-28 w-auto" />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Elevate your gaming experience with the fastest and most reliable top-up service.
                            Secure, instant, and trusted by thousands.
                        </p>
                        <div className="flex gap-3">
                            <SocialIcon icon={<RiDiscordFill size={18} />} href="#" />
                            <SocialIcon icon={<RiTwitterXFill size={18} />} href="#" />
                            <SocialIcon icon={<RiInstagramLine size={18} />} href="#" />
                            <SocialIcon icon={<RiFacebookFill size={18} />} href="#" />
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/categories" label="Games Catalog" />
                            <FooterLink href="/blogs" label="Latest News" />
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Support</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/faq" label="Help Center / FAQ" />
                            <FooterLink href="/contact" label="Contact Support" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-5">
                        <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Get in Touch</h3>
                        <div className="space-y-3">
                            <ContactItem icon={<RiMailLine />} text="support@topupio.com" />
                            <ContactItem icon={<RiPhoneLine />} text="+91 9497110191" />
                            <ContactItem icon={<RiMapPinLine />} text="Kerala, India" />
                        </div>

                        {/* Payment Methods */}
                        <div className="pt-3">
                            <h4 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Accepted Payments</h4>
                            <div className="flex flex-wrap gap-2">
                                <PaymentBadge label="VISA" />
                                <PaymentBadge label="MASTERCARD" />
                                <PaymentBadge label="PAYPAL" />
                                <PaymentBadge label="CRYPTO" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-6 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} TopUpIO. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/terms-and-conditions" className="hover:text-white transition">Terms</Link>
                        <Link href="/privacy-policy" className="hover:text-white transition">Privacy</Link>
                        <Link href="/refund-policy" className="hover:text-white transition">Refunds</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* Helper Components */
const FooterLink = ({ href, label }: { href: string; label: string }) => (
    <li>
        <Link href={href} className="text-slate-400 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group text-sm">
            <span className="w-0 h-px bg-secondary group-hover:w-2 transition-all duration-300" />
            {label}
        </Link>
    </li>
);

const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
    <Link
        href={href}
        className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-200"
    >
        {icon}
    </Link>
);

const ContactItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-3 text-slate-400 text-sm">
        <span className="text-secondary">{icon}</span>
        <span>{text}</span>
    </div>
);

const PaymentBadge = ({ label }: { label: string }) => (
    <div className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[9px] font-bold text-slate-400 hover:text-white hover:border-secondary/30 transition cursor-default">
        {label}
    </div>
);

export default Footer;
