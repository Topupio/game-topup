import type { Metadata } from "next";
import AccountShell from "@/components/user/account/AccountShell";
import ChangePasswordForm from "@/components/user/account/ChangePasswordForm";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your Topupio account settings.",
    robots: { index: false, follow: false },
};

export default function SettingsPage() {
    return (
        <AccountShell title="Settings">
            <ChangePasswordForm />
        </AccountShell>
    );
}
