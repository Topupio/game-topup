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
        .sort({ order: 1, createdAt: -1 })
        .lean();

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
        .sort({ order: 1, createdAt: -1 })
        .lean();

    res.status(200).json({
        success: true,
        count: banners.length,
        data: banners,
    });
});

export const getBannerById = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id).lean();

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    res.status(200).json({
        success: true,
        data: banner,
    });
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
    const { title, link, isActive, order } = req.body;

    // Prepare updates object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (link !== undefined) updates.link = link;
    if (isActive !== undefined) updates.isActive = isActive === "true" || isActive === true;
    if (order !== undefined) updates.order = parseInt(order);

    let existingBanner;

    if (req.file) {
        // Only select imagePublicId to minimize DB overhead 
        existingBanner = await Banner.findById(req.params.id).select("imagePublicId");

        if (!existingBanner) {
            res.status(404);
            throw new Error("Banner not found");
        }

        // Upload new image and delete old image
        const uploadPromise = uploadBufferToCloudinary(req.file.buffer, "banners");
        const deletePromise = existingBanner.imagePublicId
            ? deleteImageFromCloudinary(existingBanner.imagePublicId)
            : Promise.resolve();

        // Wait for both promises to resolve
        const [upload] = await Promise.all([uploadPromise, deletePromise]);

        updates.imageUrl = upload.secure_url;
        updates.imagePublicId = upload.public_id;
    }

    // Update banner
    const updatedBanner = await Banner.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    );

    if (!updatedBanner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    res.status(200).json({ success: true, data: updatedBanner });
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id).select('imagePublicId');

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    // Delete image from Cloudinary
    const deleteImagePromise = banner.imagePublicId
        ? deleteImageFromCloudinary(banner.imagePublicId)
        : Promise.resolve();

    // Delete banner from database
    const deleteBannerPromise = Banner.findByIdAndDelete(req.params.id);

    await Promise.all([deleteImagePromise, deleteBannerPromise]);

    res.status(200).json({
        success: true,
        message: "Banner deleted successfully",
    });
});
