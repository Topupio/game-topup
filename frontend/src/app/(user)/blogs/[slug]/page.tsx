import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FaCalendarAlt, FaChevronLeft, FaClock } from "react-icons/fa";
import { blogApiServer } from "@/services/blog/blogApi.server";
import { Blog } from "@/services/blog/types";
import { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const res = await blogApiServer.get(slug);
        const blog = res.data;
        return {
            title: blog.seo?.metaTitle || blog.title,
            description: blog.seo?.metaDescription || blog.description,
            keywords: blog.seo?.keywords,
            openGraph: {
                images: [blog.coverImage],
            },
        };
    } catch (e) {
        return {
            title: "Blog Not Found",
        };
    }
}

export default async function BlogDetailsPage({ params }: Props) {
    const { slug } = await params;
    let blog: Blog | null = null;

    try {
        const res = await blogApiServer.get(slug);
        blog = res.data;
    } catch (e) {
        // console.error("Found error", e)
    }

    if (!blog) {
        notFound();
    }

    // Calculate generic read time (approx 200 words per minute)
    const totalWords = blog.content.reduce((acc, curr) => acc + curr.contentDescription.split(" ").length, 0);
    const readTime = Math.max(1, Math.ceil(totalWords / 200));

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 font-sans pb-20">
            {/* Hero Header */}
            <div className="relative h-[60vh] min-h-[400px] w-full">
                <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/70 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 pb-12">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 text-sm font-medium backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-full border border-cyan-500/30"
                        >
                            <FaChevronLeft size={12} /> Back to Updates
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                            <span className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {blog.category}
                            </span>
                            <span className="flex items-center gap-2 text-gray-300">
                                <FaCalendarAlt className="text-gray-400" />
                                {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </span>
                            <span className="flex items-center gap-2 text-gray-300">
                                <FaClock className="text-gray-400" />
                                {readTime} min read
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {blog.title}
                        </h1>

                        {blog.description && (
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed border-l-4 border-cyan-500 pl-4">
                                {blog.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="space-y-12">
                    {blog.content.map((section, idx) => (
                        <div key={section._id || idx} className="group">
                            {section.contentTitle && (
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors">
                                    {section.contentTitle}
                                </h2>
                            )}
                            <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                                {section.contentDescription}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer / Share / Tags potentially here */}
                <div className="mt-20 pt-8 border-t border-gray-800 text-center">
                    <p className="text-gray-500 italic">
                        Published in <span className="text-cyan-400">{blog.category}</span> on {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
