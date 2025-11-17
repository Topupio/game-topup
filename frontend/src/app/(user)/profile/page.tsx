"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="max-w-md mx-auto py-10">
                <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-md mx-auto py-12">
            <h1 className="text-3xl font-semibold mb-6">Your Profile</h1>

            <div className="rounded-lg border p-6 space-y-3 bg-white">
                <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <div className="text-lg font-medium truncate">{user.name}</div>
                </div>
                <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <div className="text-lg font-medium break-all">{user.email}</div>
                </div>
                <div>
                    <span className="text-sm text-gray-500">Role</span>
                    <div className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100">{user.role}</div>
                </div>
            </div>

            <button
                onClick={async () => { await logout(); toast.success("Logged out"); router.push("/login"); }}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
                Logout
            </button>
        </div>
    );
}
