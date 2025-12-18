import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        content: [
            {
                contentTitle: { type: String, required: true },
                contentDescription: { type: String, required: true },
            }
        ],
        category: {
            type: String,
            required: true,
            trim: true,
        },
        coverImage: {
            type: String,
            required: true,
        },
        coverImageId: {
            type: String,
            unique: true,

        },
        seo: {
            metaTitle: String,
            metaDescription: String,
            keywords: [String],
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog; 