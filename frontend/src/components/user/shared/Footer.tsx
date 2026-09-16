"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo/logo-2.png";
import {
    RiTwitterXFill,
    RiInstagramLine,
    RiYoutubeFill,
    RiWhatsappFill,
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
                            <SocialIcon icon={<RiInstagramLine size={18} />} href="https://www.instagram.com/_topupio.com__/" label="Instagram" />
                            <SocialIcon icon={<RiYoutubeFill size={18} />} href="https://www.youtube.com/@topupioadmin" label="YouTube" />
                            <SocialIcon icon={<RiTwitterXFill size={18} />} href="https://x.com/topupio_com" label="X" />
                            <SocialIcon icon={<RiWhatsappFill size={18} />} href="https://wa.me/919497110191" label="WhatsApp" />
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-3">
                          
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

                    </div>
                </div>

                {/* Trust and Payment Badge */}
                <section
                    className="mt-12 rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-4 shadow-sm sm:px-5 sm:py-5 lg:flex lg:items-center lg:justify-between lg:gap-8"
                    role="group"
                    aria-label="Verified business and accepted payments"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20"
                            aria-hidden="true"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold leading-5 text-white">
                                Verified &amp; Secure Supplier
                            </p>
                            <p className="mt-0.5 text-xs leading-5 text-slate-400">
                                MSME registered
                                <span className="mx-1.5 text-slate-600" aria-hidden="true">•</span>
                                <strong className="font-semibold text-slate-200">
                                    UDYAM-KL-04-0081978
                                </strong>
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-700/70 pt-4 lg:mt-0 lg:justify-end lg:border-l lg:border-t-0 lg:py-1 lg:pl-8">
                        <span className="mr-1 w-full text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:w-auto">
                            Accepted payments
                        </span>
                        <TrustChip label="UPI" dotClassName="bg-orange-400" />
                        <TrustChip label="PayPal" dotClassName="bg-blue-400" />
                        <TrustChip label="USDT" dotClassName="bg-emerald-400" />
                    </div>
                </section>

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

const SocialIcon = ({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) => (
    <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
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

const TrustChip = ({
    label,
    dotClassName,
}: {
    label: string;
    dotClassName: string;
}) => (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassName}`} aria-hidden="true" />
        {label}
    </span>
);

export default Footer;
