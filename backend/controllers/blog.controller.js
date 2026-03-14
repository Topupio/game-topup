import Blog from "../models/blog.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteFromCloudinary.js";
import mongoose from "mongoose";
import slugify from "slugify";
import { logAdminActivity } from "../utils/adminLogger.js";

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = asyncHandler(async (req, res) => {
    let { title, slug: customSlug, description, content, category, seo } = req.body;

    if (!title) {
        res.status(400);
        throw new Error("Title is required");
    }

    // 🔹 Check title uniqueness
    const existingTitle = await Blog.findOne({ title });
    if (existingTitle) {
        res.status(400);
        throw new Error("Blog with this title already exists");
    }

    // Parse content if needed
    if (typeof content === "string") {
        try {
            content = JSON.parse(content);
        } catch (e) { }
    }

    if (typeof seo === "string") {
        try {
            seo = JSON.parse(seo);
        } catch (e) { }
    }

    if (!req.file) {
        res.status(400);
        throw new Error("Cover image is required");
    }

    // 🔹 Use custom slug if provided, otherwise generate from title
    const slug = customSlug?.trim()
        ? slugify(customSlug, { lower: true, strict: true, trim: true })
        : slugify(title, { lower: true, strict: true, trim: true });

    // Check slug uniqueness
    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) {
        res.status(400);
        throw new Error("A blog with this slug already exists");
    }

    // Upload to Cloudinary
    const upload = await uploadBufferToCloudinary(req.file.buffer, "blogs");

    const blog = await Blog.create({
        title,
        slug,
        description,
        content,
        category,
        coverImage: upload.secure_url,
        coverImageId: upload.public_id,
        seo
    });

    logAdminActivity(req, {
        action: "CREATE",
        module: "blogs",
        targetId: blog._id,
        targetModel: "Blog",
        description: `Created blog: ${blog.title}`
    });

    res.status(201).json({
        success: true,
        data: blog,
    });
});

// @desc    Get all blogs (public)
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = asyncHandler(async (req, res) => {
    const { category, search = "", page = 1, limit = 10 } = req.query;

    const query = {};
    if (category) {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    const count = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    res.status(200).json({
        success: true,
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        count: blogs.length,
        data: blogs,
    });
});

// @desc    Get single blog by slug or ID
// @route   GET /api/blogs/:idOrSlug
// @access  Public
export const getSingleBlog = asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;

    let blog = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        blog = await Blog.findById(idOrSlug).lean();
    }

    if (!blog) {
        blog = await Blog.findOne({ slug: idOrSlug }).lean();
    }

    if (!blog) {
        res.status(404);
        throw new Error("Blog not found");
    }

    res.status(200).json({
        success: true,
        data: blog,
    });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        res.status(404);
        throw new Error("Blog not found");
    }

    let { title, slug: customSlug, description, content, category, seo } = req.body;

    // Parse JSON
    if (typeof content === "string") {
        try { content = JSON.parse(content); } catch (e) { }
    }

    if (typeof seo === "string") {
        try { seo = JSON.parse(seo); } catch (e) { }
    }

    // 🔹 Image update
    if (req.file) {
        const upload = await uploadBufferToCloudinary(req.file.buffer, "blogs");

        if (blog.coverImageId) {
            await deleteImageFromCloudinary(blog.coverImageId);
        }

        blog.coverImage = upload.secure_url;
        blog.coverImageId = upload.public_id;
    }

    // 🔹 Title update + uniqueness check
    const titleChanged = title && title !== blog.title;
    if (titleChanged) {
        const titleExists = await Blog.findOne({
            title,
            _id: { $ne: blog._id }
        });

        if (titleExists) {
            res.status(400);
            throw new Error("Blog title must be unique");
        }

        blog.title = title;
    }

    // 🔹 Slug update: use custom slug if provided, otherwise regenerate from new title
    if (customSlug?.trim()) {
        const newSlug = slugify(customSlug, { lower: true, strict: true, trim: true });
        if (newSlug !== blog.slug) {
            const slugExists = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
            if (slugExists) {
                res.status(400);
                throw new Error("A blog with this slug already exists");
            }
            blog.slug = newSlug;
        }
    } else if (titleChanged) {
        blog.slug = slugify(title, { lower: true, strict: true, trim: true });
    }

    // Other fields
    if (description !== undefined) blog.description = description;
    if (content !== undefined) blog.content = content;
    if (category !== undefined) blog.category = category;
    if (seo !== undefined) blog.seo = seo;

    const updatedBlog = await blog.save();

    logAdminActivity(req, {
        action: "UPDATE",
        module: "blogs",
        targetId: updatedBlog._id,
        targetModel: "Blog",
        description: `Updated blog: ${updatedBlog.title}`
    });

    res.status(200).json({
        success: true,
        data: updatedBlog
    });
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        res.status(404);
        throw new Error("Blog not found");
    }

    // Delete image from Cloudinary
    if (blog.coverImageId) {
        await deleteImageFromCloudinary(blog.coverImageId);
    }

    await blog.deleteOne();

    logAdminActivity(req, {
        action: "DELETE",
        module: "blogs",
        targetId: blog._id,
        targetModel: "Blog",
        description: `Deleted blog: ${blog.title}`
    });

    res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
    });
});