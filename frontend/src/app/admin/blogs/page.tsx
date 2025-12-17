import { blogApiServer } from "@/services/blog/blogApi.server";
import { Blog } from "@/services/blog/types"; /* id: 16 */
import AdminBlogsPage from "@/components/admin/blogs/AdminBlogsPage";

export default async function Page() {
    const blogsResponse = await blogApiServer.list();
    const blogs = blogsResponse.data;

    return <AdminBlogsPage initialBlogs={blogs} />;
}
