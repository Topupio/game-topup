import { ThemeToggle } from "@/components/user/shared/StoreTheme";
import AccountShell from "@/components/user/account/AccountShell";
import AccountOrdersList from "@/components/user/account/AccountOrdersList";

export default function AccountPage() {
    return (
        <AccountShell><section className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 mb-6"><div><h2>Appearance</h2><p>Choose light or dark theme</p></div><ThemeToggle /></section>
            {/* Desktop shows the orders inline; mobile reaches them from the menu via /account/orders */}
            <div className="hidden lg:block">
                <AccountOrdersList />
            </div>
        </AccountShell>
    );
}
