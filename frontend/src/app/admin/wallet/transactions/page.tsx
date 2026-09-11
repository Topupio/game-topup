import { Suspense } from "react";
import AdminWalletTransactions from "@/components/admin/wallet/AdminWalletTransactions";

export default function AdminWalletTransactionsPage() {
    // useSearchParams (for the ?userId= filter) opts the tree into client rendering,
    // so it needs a boundary or the build refuses to prerender this route.
    return (
        <Suspense fallback={null}>
            <AdminWalletTransactions />
        </Suspense>
    );
}
