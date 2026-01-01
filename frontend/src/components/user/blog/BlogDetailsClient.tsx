"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaChevronLeft, FaClock, FaShareAlt } from "react-icons/fa";
import { Blog } from "@/services/blog/types";

interface Props {
    blog: Blog;
    readTime: number;
}

export default function BlogDetailsClient({ blog, readTime }: Props) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="min-h-screen bg-primary font-sans text-gray-200 selection:bg-secondary/30">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-secondary z-[60] origin-left"
                style={{ scaleX }}
            />

            {/* Hero Header */}
            <div className="relative h-[70vh] min-h-[500px] w-full group overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/40 to-primary" />
                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute bottom-0 left-0 w-full p-6 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link
                                href="/blogs"
                                className="inline-flex items-center gap-2 text-white/70 hover:text-secondary transition-all mb-8 text-sm font-medium backdrop-blur-md bg-white/5 px-4 py-2 rounded-2xl border border-white/10 hover:border-secondary/50 group/back"
                            >
                                <FaChevronLeft size={10} className="group-hover/back:-translate-x-1 transition-transform" />
                                Back to Updates
                            </Link>

                            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                                <span className="flex items-center gap-1.5 bg-secondary text-primary px-4 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-[0.12em] shadow-[0_0_20px_rgba(var(--secondary),0.3)]">
                                    {blog.category}
                                </span>
                                <span className="flex items-center gap-2 text-white/55 font-normal tracking-wide">
                                    <FaCalendarAlt className="text-secondary/60" />
                                    {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </span>
                                <span className="flex items-center gap-2 text-white/55 font-normal tracking-wide">
                                    <FaClock className="text-secondary/60" />
                                    {readTime} min read
                                </span>
                            </div>

                            <h1 className="text-[2rem] md:text-[3rem] lg:text-[3.4rem] font-semibold tracking-[-0.015em] leading-[1.08] text-white mb-7">
                                {blog.title}
                            </h1>

                            <div className="flex items-center gap-6">
                                {blog.description && (
                                    <p className="text-[1.05rem] md:text-[1.1rem] text-white/80 leading-[1.7] font-light tracking-wide border-l border-secondary/50 pl-6 italic max-w-2xl">
                                        {blog.description}
                                    </p>
                                )}
                                <button className="hidden md:flex p-4 rounded-full border border-white/10 hover:border-secondary/50 hover:bg-secondary/10 transition-all text-white/50 hover:text-secondary h-fit">
                                    <FaShareAlt size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto px-6 py-16"
            >
                <article className="space-y-12">
                    {blog.content.map((section, idx) => (
                        <div key={section._id || idx} className="group">
                            {section.contentTitle && (
                                <h2 className="text-[1.4rem] md:text-[1.6rem] font-semibold tracking-tight text-white mb-5 group-hover:text-secondary transition-colors">
                                    {section.contentTitle}
                                </h2>
                            )}
                            <p className="text-[1.02rem] text-gray-300 leading-[1.8] tracking-wide font-light whitespace-pre-line">
                                {section.contentDescription}
                            </p>
                        </div>
                    ))}
                </article>

                {/* Bottom Metadata */}
                <div className="mt-20 pt-8 border-t border-gray-800 text-center">
                    <p className="text-[0.95rem] text-gray-500 italic tracking-wide">
                        Published in <span className="text-secondary">{blog.category}</span> on{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
