import { bannerApiServer } from "@/services/banner/bannerApi.server";
import AdminBannerPage from "@/components/admin/banners/AdminBannerPage";

export default async function BannerPage() {
    const res = await bannerApiServer.listAll();
    console.log('Banners:', res)
    const banners = res.data || [];

    return <AdminBannerPage initialItems={banners} />;
}