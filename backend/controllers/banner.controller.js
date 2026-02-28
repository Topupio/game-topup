import Banner from "../models/banner.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { logAdminActivity } from "../utils/adminLogger.js";

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
    const { title, link, isActive, order } = req.body;

    const desktopFile = req.files?.image?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    if (!desktopFile) {
        res.status(400);
        throw new Error("Banner image is required");
    }

    // Upload desktop image (and mobile if provided)
    const uploads = [uploadBufferToCloudinary(desktopFile.buffer, "banners")];
    if (mobileFile) uploads.push(uploadBufferToCloudinary(mobileFile.buffer, "banners"));
    const [desktopUpload, mobileUpload] = await Promise.all(uploads);

    const banner = await Banner.create({
        title,
        link,
        isActive: isActive === "true" || isActive === true,
        order: order ? parseInt(order) : 0,
        imageUrl: desktopUpload.secure_url,
        imagePublicId: desktopUpload.public_id,
        ...(mobileUpload && {
            mobileImageUrl: mobileUpload.secure_url,
            mobileImagePublicId: mobileUpload.public_id,
        }),
    });

    logAdminActivity(req, {
        action: "CREATE",
        module: "banners",
        targetId: banner._id,
        targetModel: "Banner",
        description: `Created new banner: ${banner.title || "Untitled"}`
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

    const desktopFile = req.files?.image?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    let existingBanner;

    if (desktopFile || mobileFile) {
        existingBanner = await Banner.findById(req.params.id).select("imagePublicId mobileImagePublicId");

        if (!existingBanner) {
            res.status(404);
            throw new Error("Banner not found");
        }

        const promises = [];

        if (desktopFile) {
            promises.push(uploadBufferToCloudinary(desktopFile.buffer, "banners"));
            if (existingBanner.imagePublicId) promises.push(deleteImageFromCloudinary(existingBanner.imagePublicId));
        }

        if (mobileFile) {
            promises.push(uploadBufferToCloudinary(mobileFile.buffer, "banners"));
            if (existingBanner.mobileImagePublicId) promises.push(deleteImageFromCloudinary(existingBanner.mobileImagePublicId));
        }

        const results = await Promise.all(promises);

        // Extract upload results (uploads return objects, deletes return undefined-ish)
        let idx = 0;
        if (desktopFile) {
            const upload = results[idx++];
            if (existingBanner.imagePublicId) idx++; // skip delete result
            updates.imageUrl = upload.secure_url;
            updates.imagePublicId = upload.public_id;
        }
        if (mobileFile) {
            const upload = results[idx++];
            updates.mobileImageUrl = upload.secure_url;
            updates.mobileImagePublicId = upload.public_id;
        }
    }

    // Update banner
    const updatedBanner = await Banner.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    );

    if (updatedBanner) {
        logAdminActivity(req, {
            action: "UPDATE",
            module: "banners",
            targetId: updatedBanner._id,
            targetModel: "Banner",
            description: `Updated banner: ${updatedBanner.title || "Untitled"}`
        });
    }

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
    const banner = await Banner.findById(req.params.id).select('imagePublicId mobileImagePublicId');

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    // Delete images from Cloudinary
    const deletePromises = [];
    if (banner.imagePublicId) deletePromises.push(deleteImageFromCloudinary(banner.imagePublicId));
    if (banner.mobileImagePublicId) deletePromises.push(deleteImageFromCloudinary(banner.mobileImagePublicId));

    // Delete banner from database
    deletePromises.push(Banner.findByIdAndDelete(req.params.id));

    await Promise.all(deletePromises);

    logAdminActivity(req, {
        action: "DELETE",
        module: "banners",
        targetId: req.params.id,
        targetModel: "Banner",
        description: `Deleted banner`
    });

    res.status(200).json({
        success: true,
        message: "Banner deleted successfully",
    });
});
