import { adminLogsApiServer } from "@/services/adminLogs/adminLogsApi.server";
import AdminLogsPage from "@/components/admin/logs/AdminLogsPage";

export const metadata = {
    title: "Activity Logs | Admin Dashboard",
};

export default async function LogsPage() {
    // Default fetch for page 1
    const response = await adminLogsApiServer.list({ page: 1, limit: 12 });

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Pass correct data structure */}
            <AdminLogsPage initialData={response.data} />
        </div>
    );
}
