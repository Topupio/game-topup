
"use client";

import { AuthUser } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    RiUserLine,
    RiShoppingBag3Line,
    RiCouponLine,
    RiLockPasswordLine,
    RiQuestionLine,
    RiLogoutBoxLine,
    RiWallet3Line,
} from "react-icons/ri";
import SidebarWalletCard from "@/components/user/wallet/SidebarWalletCard";

interface AccountSidebarProps {
    user: AuthUser;
    onLogout: () => void;
}

const navItems = [
    { label: "Order History", icon: RiShoppingBag3Line, href: "/account" },
    { label: "Wallet", icon: RiWallet3Line, href: "/account/wallet" },
    { label: "Coupon", icon: RiCouponLine, comingSoon: true },
    { label: "Settings", icon: RiLockPasswordLine, href: "/account/settings" },
    { label: "Help Center", icon: RiQuestionLine, href: "/faq" },
];

export default function AccountSidebar({ user, onLogout }: AccountSidebarProps) {
    const pathname = usePathname();
    const handleComingSoon = () => {
        toast.info("Coming soon!");
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === "/account") return pathname === "/account";
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
                    const className = `w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                        active
                            ? "text-secondary bg-secondary/5 border-l-3 border-secondary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-3 border-transparent"
                    }`;
                    if (item.href) {
                        return (
                            <Link key={item.label} href={item.href} className={className}>
                                <Icon className="text-lg shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    }
                    return (
                        <button
                            key={item.label}
                            onClick={item.comingSoon ? handleComingSoon : undefined}
                            className={className}
                        >
                            <Icon className="text-lg shrink-0" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Navigation - Mobile horizontal scroll */}
            <div className="lg:hidden overflow-x-auto hide-scrollbar py-3 px-3 sm:px-4">
                <div className="flex gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        const className = `flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 min-h-10 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                            active
                                ? "bg-secondary text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`;
                        if (item.href) {
                            return (
                                <Link key={item.label} href={item.href} className={className}>
                                    <Icon className="text-base" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        }
                        return (
                            <button
                                key={item.label}
                                onClick={item.comingSoon ? handleComingSoon : undefined}
                                className={className}
                            >
                                <Icon className="text-base" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
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
