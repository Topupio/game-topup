
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
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* User Profile */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center shrink-0">
                        <RiUserLine className="text-2xl text-secondary" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-foreground truncate">{user.name}</h2>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>

                {/* Balance & Points */}
                <div className="flex items-center gap-6 mt-5">
                    <div className="flex items-center gap-2">
                        <RiWallet3Line className="text-lg text-muted-foreground" />
                        <div>
                            <p className="text-lg font-bold text-foreground">$0.00</p>
                            <p className="text-xs text-muted-foreground">Balance</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex items-center gap-2">
                        <RiCoinLine className="text-lg text-yellow-500" />
                        <div>
                            <p className="text-lg font-bold text-foreground">0</p>
                            <p className="text-xs text-muted-foreground">Points</p>
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
                            : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-3 border-transparent"
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
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
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
            <div className="p-4 border-t border-border">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl py-2.5 transition-colors"
                >
                    <RiLogoutBoxLine className="text-lg" />
                    Logout
                </button>
            </div>
        </div>
    );
}
