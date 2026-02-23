import ExchangeRateManager from "@/components/admin/settings/ExchangeRateManager";

export const metadata = {
    title: "Settings | Admin Dashboard",
};

export default function SettingsPage() {
    return (
        <div className="p-2 md:p-6 max-w-[1600px] mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <ExchangeRateManager />
        </div>
    );
}
