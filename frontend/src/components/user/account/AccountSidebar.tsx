
"use client";

import { AuthUser } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    RiUserLine,
    RiShoppingBag3Line,
    RiLockPasswordLine,
    RiQuestionLine,
    RiLogoutBoxLine,
    RiWallet3Line,
    RiWhatsappFill,
    RiTelegram2Fill,
    RiArrowRightSLine,
} from "react-icons/ri";
import SidebarWalletCard from "@/components/user/wallet/SidebarWalletCard";
import { SUPPORT_WHATSAPP, WHATSAPP_CHANNEL_URL, TELEGRAM_CHANNEL_URL } from "@/lib/constants/support";

interface AccountSidebarProps {
    user: AuthUser;
    onLogout: () => void;
}

const navItems = [
    { label: "Wallet", icon: RiWallet3Line, href: "/account/wallet" },
    { label: "Order History", icon: RiShoppingBag3Line, href: "/account/orders" },
    { label: "Settings", icon: RiLockPasswordLine, href: "/account/settings" },
    { label: "Help Center", icon: RiQuestionLine, href: "/faq" },
];

export default function AccountSidebar({ user, onLogout }: AccountSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        // Desktop /account shows the order list inline, so it highlights Order History too.
        if (href === "/account/orders") return pathname === "/account" || pathname.startsWith("/account/orders");
        return pathname.startsWith(href);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* User Profile */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center shrink-0">
                        <RiUserLine className="text-xl sm:text-2xl text-secondary" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{user.name}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>

                <SidebarWalletCard />
            </div>

            {/* Navigation - Desktop vertical list */}
            <nav className="hidden lg:block py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                                active
                                    ? "text-secondary bg-secondary/5 border-l-3 border-secondary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-3 border-transparent"
                            }`}
                        >
                            <Icon className="text-lg shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Navigation - Mobile vertical icon list */}
            <nav className="lg:hidden px-3 sm:px-4 pt-3 pb-1">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    active
                                        ? "bg-secondary/10 text-secondary"
                                        : "text-gray-700 hover:bg-white"
                                }`}
                            >
                                <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                                        active ? "bg-secondary text-white" : "bg-white text-gray-500"
                                    }`}
                                >
                                    <Icon />
                                </span>
                                <span className="flex-1">{item.label}</span>
                                <RiArrowRightSLine
                                    className={`text-base shrink-0 ${active ? "text-secondary" : "text-gray-300"}`}
                                />
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Support + community links */}
            <div className="px-3 sm:px-4 pb-3 pt-2 lg:border-t lg:border-gray-100 lg:pt-4">
                <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-emerald-800 to-green-600 px-4 py-3 text-white transition-opacity hover:opacity-95"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <RiWhatsappFill className="text-lg" />
                    </span>
                    <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold">Need help?</span>
                        <span className="block text-xs text-emerald-100">Chat with us on WhatsApp</span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 lg:hidden">
                        Chat
                    </span>
                    <RiArrowRightSLine className="hidden shrink-0 text-lg text-emerald-100 lg:block" />
                </a>

                {/* Join the community */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <a
                        href={WHATSAPP_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25d366] py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    >
                        <RiWhatsappFill className="text-base" />
                        WhatsApp
                    </a>
                    <a
                        href={TELEGRAM_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#29a9eb] py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    >
                        <RiTelegram2Fill className="text-base" />
                        Telegram
                    </a>
                </div>
                <p className="mt-2 text-center text-[11px] text-gray-500">
                    🎁 Members get flash deals first
                </p>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl py-2.5 transition-colors"
                >
                    <RiLogoutBoxLine className="text-lg" />
                    Logout
                </button>
            </div>
        </div>
    );
}
