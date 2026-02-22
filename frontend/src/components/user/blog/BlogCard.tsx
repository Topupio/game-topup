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
            <div className="bg-primary/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="flex items-center gap-1.5 bg-secondary/40 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-secondary/30">
                            <FaTag size={10} /> {blog.category}
                        </span>
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                        <FaCalendarAlt />
                        <span suppressHydrationWarning>
                            {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
                        {blog.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                        {blog.description}
                    </p>

                    <div className="mt-auto">
                        <span className="text-secondary text-sm font-medium hover:underline decoration-secondary underline-offset-4">
                            Read Article &rarr;
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
