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
            <h1 className="text-4xl font-bold text-white mb-8">My Account</h1>

            {/* PROFILE CARD */}
            <div className="
                bg-white/10 backdrop-blur-xl border border-white/20 
                rounded-2xl p-6 flex items-center gap-6 shadow-xl
            ">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <RiUserLine className="text-3xl text-white" />
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                    <p className="text-gray-300">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs bg-white/10 border border-white/20 rounded-xl text-gray-300">
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
                    mt-10 w-full md:w-auto flex items-center gap-2 
                    bg-red-600 hover:bg-red-700 text-white 
                    px-6 py-3 rounded-xl transition shadow-lg
                "
            >
                <RiLogoutBoxLine size={22} />
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
                bg-white/10 backdrop-blur-xl border border-white/20 
                rounded-2xl p-6 flex flex-col items-center 
                shadow-lg hover:shadow-2xl transition
                hover:bg-white/20
            "
        >
            <div className="
                w-14 h-14 rounded-full bg-white/10 border border-white/20 
                flex items-center justify-center text-white mb-4
            ">
                {icon}
            </div>
            <p className="text-white font-medium">{title}</p>
        </a>
    );
}
