import Game from "../models/game.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import slugify from "slugify";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const getGames = asyncHandler(async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Create a new game
// @route   POST /api/games
// @access  Admin
const createGame = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    // -------------------------------
    // 1. Parse & Validate requiredFields
    // -------------------------------
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

    // --------------------------------
    // 2. Basic Validations
    // --------------------------------
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

    // --------------------------------
    // 3. Slug & Duplicate Check
    // --------------------------------
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Game.findOne({ slug });

    if (existing) {
        return res.status(409).json({
            success: false,
            message: "A game with this name already exists",
        });
    }

    // --------------------------------
    // 4. Upload Image
    // --------------------------------
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

    // --------------------------------
    // 5. Create Game
    // --------------------------------
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
    try {
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const deleteGame = asyncHandler(async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export {
    getGames,
    createGame,
    updateGame,
    deleteGame,
};