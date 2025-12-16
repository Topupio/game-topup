import Banner from "../models/banner.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteFromCloudinary.js";

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
    const { title, link, isActive, order } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error("Banner image is required");
    }

    // Upload to Cloudinary
    const upload = await uploadBufferToCloudinary(req.file.buffer, "banners");

    const banner = await Banner.create({
        title,
        link,
        isActive: isActive === "true" || isActive === true,
        order: order ? parseInt(order) : 0,
        imageUrl: upload.secure_url,
        imagePublicId: upload.public_id,
    });

    res.status(201).json({
        success: true,
        data: banner,
    });
});

// @desc    Get all active banners (for public frontend)
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        count: banners.length,
        data: banners,
    });
});

// @desc    Get ALL banners (active & inactive) for admin
// @route   GET /api/banners/admin
// @access  Private/Admin
export const getAllBannersAdmin = asyncHandler(async (req, res) => {
    const banners = await Banner.find({})
        .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        count: banners.length,
        data: banners,
    });
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    const { title, link, isActive, order } = req.body;

    // Handle Image Update
    if (req.file) {
        // Upload new image
        const upload = await uploadBufferToCloudinary(req.file.buffer, "banners");

        // Delete old image
        if (banner.imagePublicId) {
            await deleteImageFromCloudinary(banner.imagePublicId);
        }

        banner.imageUrl = upload.secure_url;
        banner.imagePublicId = upload.public_id;
    }

    // Update other fields if provided
    if (title !== undefined) banner.title = title;
    if (link !== undefined) banner.link = link;
    if (isActive !== undefined) banner.isActive = isActive === "true" || isActive === true;
    if (order !== undefined) banner.order = parseInt(order);

    const updatedBanner = await banner.save();

    res.status(200).json({
        success: true,
        data: updatedBanner,
    });
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    // Delete image from Cloudinary
    if (banner.imagePublicId) {
        await deleteImageFromCloudinary(banner.imagePublicId);
    }

    await banner.deleteOne();

    res.status(200).json({
        success: true,
        message: "Banner deleted successfully",
    });
});
