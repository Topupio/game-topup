import AccountShell from "@/components/user/account/AccountShell";
import AccountOrdersList from "@/components/user/account/AccountOrdersList";

export default function AccountPage() {
    return (
        <AccountShell>
            {/* Desktop shows the orders inline; mobile reaches them from the menu via /account/orders */}
            <div className="hidden lg:block">
                <AccountOrdersList />
            </div>
        </AccountShell>
    );
}
