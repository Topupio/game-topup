"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

import {
    RiUserLine,
    RiCouponLine,
    RiWallet3Line,
    RiShoppingBag3Line,
    RiSettings3Line,
    RiLogoutBoxLine,
    RiTimeLine
} from "react-icons/ri";

export default function AccountPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4 animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="h-32 bg-gray-300 rounded-xl"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto py-16 px-4">

            {/* HEADER */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

            {/* PROFILE CARD */}
            <div className="
                bg-white border border-gray-200 
                rounded-2xl p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition
            ">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <RiUserLine className="text-3xl text-secondary" />
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs bg-secondary/10 border border-secondary/20 rounded-xl text-secondary font-medium">
                        {user.role}
                    </span>
                </div>
            </div>

            {/* MAIN GRID OPTIONS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">

                <AccountCard
                    icon={<RiShoppingBag3Line size={28} />}
                    title="My Orders"
                    link="/orders"
                />

                <AccountCard
                    icon={<RiWallet3Line size={28} />}
                    title="Wallet"
                    link="/wallet"
                />

                <AccountCard
                    icon={<RiCouponLine size={28} />}
                    title="Coupons"
                    link="/coupons"
                />

                <AccountCard
                    icon={<RiSettings3Line size={28} />}
                    title="Account Settings"
                    link="/account/settings"
                />
            </div>

            {/* LOGOUT BUTTON */}
            <button
                onClick={async () => {
                    await logout();
                    toast.success("Logged out");
                    router.push("/login");
                }}
                className="
                    mt-10 w-full md:w-auto flex items-center justify-center gap-2 
                    bg-red-500 hover:bg-red-600 text-white 
                    px-6 py-3 rounded-xl transition shadow-sm hover:shadow-md font-medium
                "
            >
                <RiLogoutBoxLine size={20} />
                Logout
            </button>
        </div>
    );
}

/* ---------------------------------- */
/* ACCOUNT CARD COMPONENT */
/* ---------------------------------- */
function AccountCard({ icon, title, link }: { icon: any; title: string; link: string }) {
    return (
        <a
            href={link}
            className="
                bg-white border border-gray-200 
                rounded-2xl p-6 flex flex-col items-center 
                shadow-sm hover:shadow-md transition-all duration-300
                hover:border-secondary/30 group
            "
        >
            <div className="
                w-14 h-14 rounded-full bg-secondary/10 border border-secondary/20 
                flex items-center justify-center text-secondary mb-4
                group-hover:bg-secondary group-hover:text-white transition-colors duration-300
            ">
                {icon}
            </div>
            <p className="text-gray-900 font-medium group-hover:text-secondary transition-colors">{title}</p>
        </a>
    );
}
