import Link from "next/link";
import { blogApiServer } from "@/services/blog/blogApi.server";
import BlogCard from "@/components/user/blog/BlogCard";

export const metadata = {
    title: "News & Updates | GameTopup",
    description: "Latest news, guides, and updates from GameTopup.",
};

export default async function BlogsPage() {
    const blogResponse = await blogApiServer.list();
    const blogs = blogResponse.data;

    return (
        <div className="min-h-screen bg-primary text-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* BREADCRUMB */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-secondary transition">
                        Home
                    </Link>
                    <span className="opacity-50">›</span>
                    <span className="text-muted-foreground">News</span>
                </nav>

                {/* PAGE TITLE */}
                <div className="mb-10">
                    <h1 className="text-2xl md:text-3xl font-semibold text-white">
                        Latest News
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Updates, guides, and announcements from GameTopup
                    </p>
                </div>

                {/* LISTING */}
                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog: any) => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-xl border border-white/10 bg-primary/60">
                        <h3 className="text-lg font-medium mb-1">
                            No articles available
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Please check back later for updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
