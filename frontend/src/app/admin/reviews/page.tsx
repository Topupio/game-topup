import { Metadata } from "next";
import AdminReviewsPage from "@/components/admin/reviews/AdminReviewsPage";
import { reviewsApiServer } from "@/services/reviews/reviewsApi.server";

export const metadata: Metadata = {
    title: "Review Management | Admin Dashboard",
};

export default async function ReviewsAdminPage() {
    const initialData = await reviewsApiServer.adminGetReviews({
        page: 1,
        limit: 12,
    });

    return (
        <div className="p-2 md:p-6 max-w-[1600px] mx-auto">
            <AdminReviewsPage initialData={initialData} />
        </div>
    );
}
