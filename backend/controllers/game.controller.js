import Game from "../models/game.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import slugify from "slugify";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteFromCloudinary.js";
import { logAdminActivity } from "../utils/adminLogger.js";
import { CHECKOUT_TEMPLATE_KEYS } from "../constants/checkoutTemplates.js";
import { REGION_KEYS } from "../constants/regions.js";

/**
 * Parse a JSON field from form-data (may arrive as a string).
 */
function parseJsonField(value) {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value; // return as-is if not valid JSON
        }
    }
    return value;
}

/**
 * Validate required fields array (for custom checkout template).
 */
function validateRequiredFields(requiredFields) {
    if (!Array.isArray(requiredFields)) {
        return "requiredFields must be an array";
    }

    const allowedTypes = ["text", "number", "email", "password", "dropdown"];
    const fieldKeySet = new Set();

    for (const field of requiredFields) {
        if (!field.fieldName || !field.fieldKey) {
            return "Each required field must have fieldName and fieldKey";
        }
        if (!allowedTypes.includes(field.fieldType)) {
            return `Invalid fieldType '${field.fieldType}'. Allowed: ${allowedTypes.join(", ")}`;
        }
        if (field.fieldType === "dropdown" && (!field.options || field.options.length === 0)) {
            return "Dropdown fields must have non-empty 'options'";
        }
        if (fieldKeySet.has(field.fieldKey)) {
            return `Duplicate fieldKey '${field.fieldKey}' found`;
        }
        fieldKeySet.add(field.fieldKey);
    }
    return null;
}

/**
 * Validate variants array and auto-generate slugs.
 */
function validateAndPrepareVariants(variants, regions) {
    if (!Array.isArray(variants)) {
        return { error: "variants must be an array" };
    }

    const slugSet = new Set();

    for (let i = 0; i < variants.length; i++) {
        const v = variants[i];

        if (!v.name || v.name.trim().length === 0) {
            return { error: `Variant #${i + 1}: name is required` };
        }

        // Auto-generate slug if missing
        if (!v.slug) {
            v.slug = slugify(v.name, { lower: true, strict: true });
        }

        if (slugSet.has(v.slug)) {
            return { error: `Duplicate variant slug '${v.slug}'` };
        }
        slugSet.add(v.slug);

        // Validate region pricing
        if (v.regionPricing && Array.isArray(v.regionPricing)) {
            for (const rp of v.regionPricing) {
                if (!rp.region || !REGION_KEYS.includes(rp.region)) {
                    return { error: `Variant '${v.name}': invalid region '${rp.region}'` };
                }
                if (typeof rp.price !== "number" || rp.price < 0) {
                    return { error: `Variant '${v.name}': price must be a non-negative number for region '${rp.region}'` };
                }
                if (typeof rp.discountedPrice !== "number" || rp.discountedPrice < 0) {
                    return { error: `Variant '${v.name}': discountedPrice must be a non-negative number for region '${rp.region}'` };
                }
                if (rp.discountedPrice > rp.price) {
                    return { error: `Variant '${v.name}': discountedPrice cannot exceed price for region '${rp.region}'` };
                }
            }
        }

        // Validate checkout template per variant
        if (v.checkoutTemplate && !["", ...CHECKOUT_TEMPLATE_KEYS].includes(v.checkoutTemplate)) {
            return { error: `Variant '${v.name}': invalid checkoutTemplate '${v.checkoutTemplate}'` };
        }
        v.checkoutTemplate = v.checkoutTemplate || "";
        v.checkoutTemplateOptions = v.checkoutTemplateOptions || {};

        // Set defaults
        v.status = v.status || "active";
        v.isPopular = v.isPopular || false;
        v.deliveryTime = v.deliveryTime || "Instant Delivery";
    }

    return { data: variants };
}

const getGames = asyncHandler(async (req, res) => {
    const {
        search = "",
        status,
        category,
        page,
        limit = 12,
        sort = "createdAt",
        order = "desc"
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    if (status && ["active", "inactive"].includes(status)) {
        query.status = status;
    }

    if (category) {
        const categories = category.split(",");
        query.category = { $in: categories };
    }

    const sortQuery = {
        [sort]: order === "asc" ? 1 : -1
    };

    const games = await Game.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum);

    const total = await Game.countDocuments(query);

    return res.status(200).json({
        success: true,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        count: games.length,
        data: games
    });
});

const getHomePageGames = asyncHandler(async (req, res) => {
    const result = await Game.aggregate([
        { $match: { status: "active" } },
        {
            $setWindowFields: {
                partitionBy: "$category",
                sortBy: { createdAt: -1 },
                output: {
                    rank: { $rank: {} }
                }
            }
        },
        { $match: { rank: { $lte: 6 } } },
        {
            $group: {
                _id: "$category",
                games: { $push: "$$ROOT" }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                category: "$_id",
                games: 1
            }
        }
    ]);

    res.status(200).json({
        success: true,
        categories: result,
        totalCategories: result.length
    });
});

const getDistinctCategories = asyncHandler(async (req, res) => {
    const categories = await Game.distinct("category");

    return res.status(200).json({
        success: true,
        categories
    });
});

const getGameDetails = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const game = await Game.findOne({ slug });

    if (!game) {
        return res.status(404).json({
            success: false,
            message: "Game not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: game,
    });
});

// @desc    Create a new game
// @route   POST /api/games
// @access  Admin
const createGame = asyncHandler(async (req, res) => {
    const { name, description, richDescription, status, metaTitle, metaDescription, topupType, paymentCategory } = req.body;

    // 1. Parse JSON fields from form-data
    let variants = parseJsonField(req.body.variants);
    let regions = parseJsonField(req.body.regions);

    // 2. Validate basic fields
    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Game name is required (min 2 characters)",
        });
    }

    if (!req.body.category || req.body.category.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Game category is required" });
    }

    // Image validation
    const gameImageFile = req.files?.find(f => f.fieldname === "image");
    if (!gameImageFile) {
        return res.status(400).json({ success: false, message: "Game image is required" });
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(gameImageFile.mimetype)) {
        return res.status(400).json({
            success: false,
            message: "Only JPG, PNG, and WEBP images are allowed",
        });
    }

    // 4. Validate regions
    if (regions && Array.isArray(regions)) {
        for (const r of regions) {
            if (!REGION_KEYS.includes(r)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid region '${r}'. Allowed: ${REGION_KEYS.join(", ")}`,
                });
            }
        }
    } else {
        regions = ["global"];
    }

    // 5. Validate variants
    if (variants && Array.isArray(variants) && variants.length > 0) {
        const result = validateAndPrepareVariants(variants, regions);
        if (result.error) {
            return res.status(400).json({ success: false, message: result.error });
        }
        variants = result.data;
    } else {
        variants = [];
    }

    // 7. Slug & duplicate check
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Game.findOne({ slug });

    if (existing) {
        return res.status(409).json({
            success: false,
            message: "A game with this name already exists",
        });
    }

    // 8. Upload game image
    let uploadedImageUrl = null;
    let uploadedImagePublicId = null;

    try {
        const uploadResult = await uploadBufferToCloudinary(gameImageFile.buffer, "games");
        uploadedImageUrl = uploadResult.secure_url;
        uploadedImagePublicId = uploadResult.public_id;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return res.status(500).json({
            success: false,
            message: "Image upload failed",
        });
    }

    // 8b. Upload variant images
    if (variants && variants.length > 0 && req.files) {
        for (const file of req.files) {
            const match = file.fieldname.match(/^variantImage_(\d+)$/);
            if (!match) continue;
            const idx = parseInt(match[1], 10);
            if (idx >= variants.length) continue;

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) continue;

            try {
                const result = await uploadBufferToCloudinary(file.buffer, "game-variants");
                variants[idx].imageUrl = result.secure_url;
                variants[idx].imagePublicId = result.public_id;
            } catch (err) {
                console.error(`Variant image upload failed for index ${idx}:`, err);
            }
        }
    }

    // 9. Create game
    let newGame;

    try {
        newGame = await Game.create({
            name: name.trim(),
            slug,
            category: req.body.category.trim().toLowerCase(),
            paymentCategory: paymentCategory?.trim().toLowerCase() || "",
            imageUrl: uploadedImageUrl,
            imagePublicId: uploadedImagePublicId,
            description: description?.trim() || "",
            richDescription: richDescription || "",
            topupType: topupType?.trim() || "",
            regions,
            variants,
            status: status === "inactive" ? "inactive" : "active",
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || "",
        });
    } catch (err) {
        if (uploadedImagePublicId) {
            await deleteImageFromCloudinary(uploadedImagePublicId);
        }
        throw err;
    }

    logAdminActivity(req, {
        action: "CREATE",
        module: "games",
        targetId: newGame._id,
        targetModel: "Game",
        description: `Created new game: ${newGame.name}`
    });

    return res.status(201).json({
        success: true,
        message: "Game created successfully",
        data: newGame,
    });
});

const updateGame = asyncHandler(async (req, res) => {
    const { name, description, richDescription, status, metaTitle, metaDescription, topupType, paymentCategory } = req.body;
    const category = req.body.category?.trim().toLowerCase();

    // 1. Fetch existing game
    const game = await Game.findOne({ slug: req.params.slug });
    if (!game) {
        return res.status(404).json({
            success: false,
            message: "Game not found",
        });
    }

    // 2. Parse JSON fields from form-data
    let variants = parseJsonField(req.body.variants);
    let regions = parseJsonField(req.body.regions);

    // 3. Validate regions if provided
    if (regions && Array.isArray(regions)) {
        for (const r of regions) {
            if (!REGION_KEYS.includes(r)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid region '${r}'. Allowed: ${REGION_KEYS.join(", ")}`,
                });
            }
        }
    }

    // 4. Validate variants if provided
    if (variants && Array.isArray(variants) && variants.length > 0) {
        const selectedRegions = regions || game.regions;
        const result = validateAndPrepareVariants(variants, selectedRegions);
        if (result.error) {
            return res.status(400).json({ success: false, message: result.error });
        }
        variants = result.data;
    }

    // 7. If name changed, regenerate slug
    let updatedSlug = game.slug;

    if (name && name.trim() !== game.name) {
        updatedSlug = slugify(name, { lower: true, strict: true });

        const slugExists = await Game.findOne({ slug: updatedSlug, _id: { $ne: game._id } });
        if (slugExists) {
            return res.status(409).json({
                success: false,
                message: "Another game already exists with this name",
            });
        }
    }

    // 8. Image update handling
    let updatedImageUrl = game.imageUrl;
    let updatedImagePublicId = game.imagePublicId;

    const gameImageFile = req.files?.find(f => f.fieldname === "image");
    if (gameImageFile) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(gameImageFile.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG and WEBP images are allowed",
            });
        }

        const uploadResult = await uploadBufferToCloudinary(gameImageFile.buffer, "games");
        updatedImageUrl = uploadResult.secure_url;
        updatedImagePublicId = uploadResult.public_id;

        if (game.imagePublicId) {
            await deleteImageFromCloudinary(game.imagePublicId);
        }
    }

    // 8b. Variant image uploads
    if (variants && variants.length > 0 && req.files) {
        for (const file of req.files) {
            const match = file.fieldname.match(/^variantImage_(\d+)$/);
            if (!match) continue;
            const idx = parseInt(match[1], 10);
            if (idx >= variants.length) continue;

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) continue;

            try {
                // Delete old variant image if exists
                if (variants[idx].imagePublicId) {
                    await deleteImageFromCloudinary(variants[idx].imagePublicId);
                }

                const result = await uploadBufferToCloudinary(file.buffer, "game-variants");
                variants[idx].imageUrl = result.secure_url;
                variants[idx].imagePublicId = result.public_id;
            } catch (err) {
                console.error(`Variant image upload failed for index ${idx}:`, err);
            }
        }
    }

    // 9. Apply updates
    game.name = name ?? game.name;
    game.slug = updatedSlug;
    game.category = category ?? game.category;
    game.paymentCategory = paymentCategory?.trim().toLowerCase() ?? game.paymentCategory;
    game.topupType = topupType ?? game.topupType;
    game.description = description ?? game.description;
    game.richDescription = richDescription ?? game.richDescription;
    game.status = status ?? game.status;
    game.metaTitle = metaTitle ?? game.metaTitle;
    game.metaDescription = metaDescription ?? game.metaDescription;
    game.imageUrl = updatedImageUrl;
    game.imagePublicId = updatedImagePublicId;

    // New fields
    if (regions !== undefined) {
        game.regions = regions;
    }
    if (variants !== undefined) {
        game.variants = variants;
    }

    // 10. Save
    const updatedGame = await game.save();

    logAdminActivity(req, {
        action: "UPDATE",
        module: "games",
        targetId: updatedGame._id,
        targetModel: "Game",
        description: `Updated game: ${updatedGame.name}`
    });

    return res.status(200).json({
        success: true,
        message: "Game updated successfully",
        data: updatedGame,
    });
});

const deleteGame = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const game = await Game.findById(id);

    if (!game) {
        return res.status(404).json({
            success: false,
            message: "Game not found",
        });
    }

    if (game.imagePublicId) {
        try {
            await deleteImageFromCloudinary(game.imagePublicId);
        } catch (error) {
            console.error("Cloudinary image deletion error:", error);
        }
    }

    await Game.findByIdAndDelete(id);

    logAdminActivity(req, {
        action: "DELETE",
        module: "games",
        targetId: id,
        targetModel: "Game",
        description: `Deleted game: ${game.name}`
    });

    return res.status(200).json({
        success: true,
        message: "Game deleted successfully",
    });
});

export {
    getGames,
    getHomePageGames,
    getDistinctCategories,
    getGameDetails,
    createGame,
    updateGame,
    deleteGame,
};
