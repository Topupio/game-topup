import Game from "../models/game.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import slugify from "slugify";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteFromCloudinary.js";

const getGames = asyncHandler(async (req, res) => {
    // 1. Query parameters
    const {
        search = "",
        status,
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc"
    } = req.query;

    const query = {};

    // 2. Search by name or description
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    // 3. Filter by status (active/inactive)
    if (status && ["active", "inactive"].includes(status)) {
        query.status = status;
    }
    // 4. Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 5. Sorting
    const sortQuery = {
        [sort]: order === "asc" ? 1 : -1,
    };

    // 6. Fetch Games
    const games = await Game.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Game.countDocuments(query);

    // 7. Send Response
    return res.status(200).json({
        success: true,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        count: games.length,
        data: games,
    });
});

const getGameDetails = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    
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
    const { name, description, status } = req.body;

    // 1. Parse & Validate requiredFields
    let requiredFields = req.body.requiredFields;

    if (typeof requiredFields === "string") {
        try {
            requiredFields = JSON.parse(requiredFields);
        } catch {
            return res.status(400).json({
                success: false,
                message: "requiredFields must be valid JSON",
            });
        }
    }

    if (requiredFields && !Array.isArray(requiredFields)) {
        return res.status(400).json({
            success: false,
            message: "requiredFields must be an array",
        });
    }

    // Validate each dynamic field
    if (requiredFields) {
        const allowedTypes = ["text", "number", "email", "dropdown"];
        const fieldKeySet = new Set();

        for (const field of requiredFields) {
            if (!field.fieldName || !field.fieldKey) {
                return res.status(400).json({
                    success: false,
                    message: "Each required field must have fieldName and fieldKey",
                });
            }

            if (!allowedTypes.includes(field.fieldType)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid fieldType '${field.fieldType}'. Allowed: ${allowedTypes.join(", ")}`,
                });
            }

            // Dropdown must have options
            if (field.fieldType === "dropdown" && (!field.options || field.options.length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: `Dropdown fields must include non-empty 'options' array`,
                });
            }

            // Prevent duplicate fieldKeys
            if (fieldKeySet.has(field.fieldKey)) {
                return res.status(400).json({
                    success: false,
                    message: `Duplicate fieldKey '${field.fieldKey}' found`,
                });
            }
            fieldKeySet.add(field.fieldKey);
        }
    }

    // 2. Basic Validations
    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Game name is required (min 2 characters)",
        });
    }

    // Image validation
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Game image is required" });
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            message: "Only JPG, PNG, and WEBP images are allowed",
        });
    }

    // 3. Slug & Duplicate Check
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Game.findOne({ slug });

    if (existing) {
        return res.status(409).json({
            success: false,
            message: "A game with this name already exists",
        });
    }

    // 4. Upload Image
    let uploadedImageUrl = null;
    let uploadedImagePublicId = null;

    try {
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "games");
        uploadedImageUrl = uploadResult.secure_url;
        uploadedImagePublicId = uploadResult.public_id;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return res.status(500).json({
            success: false,
            message: "Image upload failed",
        });
    }

    // 5. Create Game
    let newGame;

    try {
        newGame = await Game.create({
            name: name.trim(),
            slug,
            imageUrl: uploadedImageUrl,
            imagePublicId: uploadedImagePublicId,
            description: description?.trim() || "",
            requiredFields: requiredFields || [],
            status: status === "inactive" ? "inactive" : "active",
        });
    } catch (err) {
        // Cleanup orphaned Cloudinary image
        if (uploadedImagePublicId) {
            await deleteImageFromCloudinary(uploadedImagePublicId);
        }

        throw err;
    }

    return res.status(201).json({
        success: true,
        message: "Game created successfully",
        data: newGame,
    });
});

const updateGame = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    // 1. Fetch existing game
    const game = await Game.findById(req.params.id);
    if (!game) {
        return res.status(404).json({
            success: false,
            message: "Game not found",
        });
    }

    // 2. Parse requiredFields (form-data support)
    let requiredFields = req.body.requiredFields;

    if (typeof requiredFields === "string") {
        try {
            requiredFields = JSON.parse(requiredFields);
        } catch {
            return res.status(400).json({
                success: false,
                message: "requiredFields must be valid JSON",
            });
        }
    }

    // 3. Validate requiredFields if provided
    if (requiredFields) {
        if (!Array.isArray(requiredFields)) {
            return res.status(400).json({
                success: false,
                message: "requiredFields must be an array",
            });
        }

        const allowedTypes = ["text", "number", "email", "dropdown"];
        const fieldKeySet = new Set();

        for (const field of requiredFields) {
            if (!field.fieldName || !field.fieldKey) {
                return res.status(400).json({
                    success: false,
                    message: "Each required field must have fieldName and fieldKey",
                });
            }

            if (!allowedTypes.includes(field.fieldType)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid fieldType '${field.fieldType}'. Allowed: ${allowedTypes.join(", ")}`
                });
            }

            if (field.fieldType === "dropdown" && (!field.options || field.options.length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: "Dropdown fields must have non-empty 'options'"
                });
            }

            if (fieldKeySet.has(field.fieldKey)) {
                return res.status(400).json({
                    success: false,
                    message: `Duplicate fieldKey '${field.fieldKey}' found`,
                });
            }
            fieldKeySet.add(field.fieldKey);
        }
    }

    // 4. If name changed, regenerate slug
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

    // 5. Image update handling (optional)
    let updatedImageUrl = game.imageUrl;
    let updatedImagePublicId = game.imagePublicId;

    if (req.file) {
        // Validate image type
        if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG and WEBP images are allowed",
            });
        }

        // Upload new image
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "games");
        updatedImageUrl = uploadResult.secure_url;
        updatedImagePublicId = uploadResult.public_id;

        // Delete old image if exists
        if (game.imagePublicId) {
            await deleteImageFromCloudinary(game.imagePublicId);
        }
    }

    // 6. Apply updates
    game.name = name ?? game.name;
    game.slug = updatedSlug;
    game.description = description ?? game.description;
    game.status = status ?? game.status;

    if (requiredFields) {
        game.requiredFields = requiredFields;
    }

    game.imageUrl = updatedImageUrl;
    game.imagePublicId = updatedImagePublicId;

    // 7. Save Game
    const updatedGame = await game.save();

    return res.status(200).json({
        success: true,
        message: "Game updated successfully",
        data: updatedGame,
    });
});

const deleteGame = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Check if game exists
    const game = await Game.findById(id);

    if (!game) {
        return res.status(404).json({
            success: false,
            message: "Game not found",
        });
    }

    // 2. Delete Cloudinary image if exists
    if (game.imagePublicId) {
        try {
            await cloudinary.uploader.destroy(game.imagePublicId);
        } catch (error) {
            console.error("Cloudinary image deletion error:", error);
        }
    }

    // 3. Delete Game Document
    await Game.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Game deleted successfully",
    });
});

export {
    getGames,
    getGameDetails,
    createGame,
    updateGame,
    deleteGame,
};