"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/authApi";
import { toast } from "react-toastify";
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";

export default function ChangePasswordForm() {
    const { user } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            await authApi.changePassword({ currentPassword, newPassword });
            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            let message = "Failed to change password";
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as { response?: { data?: { message?: string } } };
                message = axiosErr.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    const isGoogleUser = user.authProvider === "google";

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <RiLockPasswordLine className="text-2xl text-secondary" />
                <h1 className="text-xl font-semibold text-gray-900">Change Password</h1>
            </div>

            {isGoogleUser ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-600">
                        Password change is not available for Google accounts.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary pr-10"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrent ? <RiEyeOffLine /> : <RiEyeLine />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary pr-10"
                                placeholder="At least 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNew ? <RiEyeOffLine /> : <RiEyeLine />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary pr-10"
                                placeholder="Repeat new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirm ? <RiEyeOffLine /> : <RiEyeLine />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-2.5 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-secondary/90 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? "Changing..." : "Change Password"}
                    </button>
                </form>
            )}
        </div>
    );
}
