
"use client";

import { AuthUser } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Link from "next/link";
import {
    RiUserLine,
    RiShoppingBag3Line,
    RiCouponLine,
    RiSettings3Line,
    RiQuestionLine,
    RiLogoutBoxLine,
    RiWallet3Line,
    RiCoinLine,
} from "react-icons/ri";

interface AccountSidebarProps {
    user: AuthUser;
    onLogout: () => void;
}

const navItems = [
    { label: "Order History", icon: RiShoppingBag3Line, active: true },
    { label: "Coupon", icon: RiCouponLine, comingSoon: true },
    { label: "Settings", icon: RiSettings3Line, comingSoon: true },
    { label: "Help Center", icon: RiQuestionLine, href: "/faq" },
];

export default function AccountSidebar({ user, onLogout }: AccountSidebarProps) {
    const handleComingSoon = () => {
        toast.info("Coming soon!");
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* User Profile */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center shrink-0">
                        <RiUserLine className="text-2xl text-secondary" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-gray-900 truncate">{user.name}</h2>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>

                {/* Balance & Points */}
                <div className="flex items-center gap-6 mt-5">
                    <div className="flex items-center gap-2">
                        <RiWallet3Line className="text-lg text-gray-400" />
                        <div>
                            <p className="text-lg font-bold text-gray-900">$0.00</p>
                            <p className="text-xs text-gray-400">Balance</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <RiCoinLine className="text-lg text-yellow-500" />
                        <div>
                            <p className="text-lg font-bold text-gray-900">0</p>
                            <p className="text-xs text-gray-400">Points</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation - Desktop vertical list */}
            <nav className="hidden lg:block py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const className = `w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                        item.active
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
            <div className="lg:hidden overflow-x-auto py-3 px-4">
                <div className="flex gap-2 min-w-max">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const className = `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            item.active
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
