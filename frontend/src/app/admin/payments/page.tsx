import PaymentSettingsManager from "@/components/admin/payments/PaymentSettingsManager";
import { MdPayment } from "react-icons/md";

export const metadata = {
    title: "Payments | Admin Dashboard",
};

export default function PaymentsPage() {
    return (
        <div className="p-2 md:p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-gray-100 p-4">
                        <MdPayment className="text-3xl text-gray-700" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Payments
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage checkout configuration now, and expand transaction operations here later.
                        </p>
                    </div>
                </div>
            </div>

            <PaymentSettingsManager />

            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
                <h2 className="text-lg font-bold text-gray-900">
                    Transactions Dashboard
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Payment transaction reporting and reconciliation tools can be added here next. The UPI QR setup above is already live for checkout.
                </p>
            </div>
        </div>
    );
}
