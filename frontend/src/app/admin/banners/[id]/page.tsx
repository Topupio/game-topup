import BannerForm from "@/components/admin/banners/BannerForm";

export default async function BannerFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BannerForm bannerId={id} />;
}
