import BlogForm from "@/components/admin/blogs/BlogForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BlogForm blogId={id} />;
}
