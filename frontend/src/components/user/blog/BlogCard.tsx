"use client";

import Link from "next/link";
import Image from "next/image";
import { Blog } from "@/services/blog/types";
import { FaCalendarAlt, FaTag } from "react-icons/fa";

interface Props {
    blog: Blog;
}

export default function BlogCard({ blog }: Props) {
    return (
        <Link href={`/blogs/${blog.slug}`} className="group block h-full">
            <div className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="flex items-center gap-1.5 bg-cyan-950/80 backdrop-blur-md text-cyan-400 text-xs px-2.5 py-1 rounded-full border border-cyan-800/50">
                            <FaTag size={10} /> {blog.category}
                        </span>
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                        <FaCalendarAlt />
                        <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {blog.title}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                        {blog.description}
                    </p>

                    <div className="mt-auto">
                        <span className="text-cyan-500 text-sm font-medium hover:underline decoration-cyan-500 underline-offset-4">
                            Read Article &rarr;
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
