import { usersApiServer } from "@/services/users/usersApi.server";
import AdminUsersPage from "@/components/admin/users/AdminUsersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Management | Admin Dashboard",
};

export default async function UsersPage() {
    const initialData = await usersApiServer.list({ page: 1, limit: 12 });

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-500 text-sm mt-1">Manage user accounts, monitor activity, and enforce security policies.</p>
            </div>

            <AdminUsersPage initialData={initialData} />
        </div>
    );
}