import { MdPayment } from "react-icons/md";

export const metadata = {
    title: "Payments | Admin Dashboard",
};

export default function PaymentsPage() {
    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 max-w-md w-full">
                    <MdPayment className="text-6xl text-gray-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Payments
                    </h1>
                    <p className="text-gray-400 mb-4">
                        This feature is coming soon. You&apos;ll be able to
                        manage and track all payment transactions here.
                    </p>
                    <span className="inline-block px-4 py-1.5 bg-yellow-500/10 text-yellow-400 text-sm font-medium rounded-full border border-yellow-500/20">
                        Coming Soon
                    </span>
                </div>
            </div>
        </div>
    );
}
