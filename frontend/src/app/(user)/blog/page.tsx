import { blogApiServer } from "@/services/blog/blogApi.server";
import BlogCard from "@/components/user/blog/BlogCard";
import { Blog } from "@/services/blog";

export const metadata = {
    title: "Latest News & Updates | GameTopup",
    description: "Read the latest news, guides, and updates about your favorite games and top-up services.",
};

export default async function BlogsPage() {
    const blogsResponse = await blogApiServer.list()
    const blogs = blogsResponse.data

    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Updates</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Stay informed with our latest game guides, promotional events, and platform updates.
                    </p>
                </div>

                {/* Grid */}
                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog: Blog) => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
                            <span className="text-4xl">📰</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No updates yet</h3>
                        <p className="text-gray-400">Check back later for the latest news.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
