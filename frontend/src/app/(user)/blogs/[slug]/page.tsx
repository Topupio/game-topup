import { notFound } from "next/navigation";
import { blogApiServer } from "@/services/blog/blogApi.server";
import { Blog } from "@/services/blog/types";
import { Metadata } from "next";
import BlogDetailsClient from "@/components/user/blog/BlogDetailsClient";

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

    return <BlogDetailsClient blog={blog} readTime={readTime} />;
}
