"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo/logo-nobg.png";
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
        <footer className="relative bg-primary border-t border-white/10 pt-20 pb-10 overflow-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tertiary/5 blur-[120px] rounded-full translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-4 lg:px-0 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                            <Image src={logo} alt="Logo" className="h-16 w-auto" />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Elevate your gaming experience with the fastest and most reliable top-up service.
                            Secure, instant, and trusted by thousands.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<RiDiscordFill size={20} />} href="#" />
                            <SocialIcon icon={<RiTwitterXFill size={20} />} href="#" />
                            <SocialIcon icon={<RiInstagramLine size={20} />} href="#" />
                            <SocialIcon icon={<RiFacebookFill size={20} />} href="#" />
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Quick Links</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/categories" label="Games Catalog" />
                            <FooterLink href="/blogs" label="Latest News" />
                            <FooterLink href="/about" label="About Us" />
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Support</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/faq" label="Help Center / FAQ" />
                            <FooterLink href="/contact" label="Contact Support" />
                            <FooterLink href="/terms" label="Terms of Service" />
                            <FooterLink href="/privacy" label="Privacy Policy" />
                            <FooterLink href="/refund" label="Refund Policy" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-white font-bold mb-6 text-lg">Get in Touch</h3>
                        <div className="space-y-4">
                            <ContactItem icon={<RiMailLine />} text="support@gametopup.com" />
                            <ContactItem icon={<RiPhoneLine />} text="+1 (555) 000-0000" />
                            <ContactItem icon={<RiMapPinLine />} text="Gaming Street, Silicon Valley, CA" />
                        </div>

                        {/* Payment Methods Placeholder */}
                        <div className="pt-4">
                            <h4 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-3">Accepted Payments</h4>
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
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} GameTopup. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/terms" className="hover:text-white transition">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
                        <Link href="/cookies" className="hover:text-white transition">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* Helper Components */
const FooterLink = ({ href, label }: { href: string; label: string }) => (
    <li>
        <Link href={href} className="text-gray-400 hover:text-secondary transition-colors duration-200 flex items-center gap-2 group text-sm">
            <span className="w-0 h-[1px] bg-secondary group-hover:w-2 transition-all duration-300" />
            {label}
        </Link>
    </li>
);

const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
    <Link
        href={href}
        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-300"
    >
        {icon}
    </Link>
);

const ContactItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-3 text-gray-400 text-sm">
        <span className="text-secondary">{icon}</span>
        <span>{text}</span>
    </div>
);

const PaymentBadge = ({ label }: { label: string }) => (
    <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-gray-500 hover:text-white hover:border-white/20 transition cursor-default">
        {label}
    </div>
);

export default Footer;
