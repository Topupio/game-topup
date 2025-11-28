import Product from "../models/product.model.js";
import Game from "../models/game.model.js";
import slugify from "slugify";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteFromCloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
    const {
        gameId,
        name,
        description,
        price,
        discountedPrice,
        deliveryTime,
        status,
        isPopular,
        metaTitle,
        metaDescription,
    } = req.body;

    // 1. Required fields
    if (!gameId || !name || !price || !discountedPrice) {
        return res.status(400).json({
            success: false,
            message: "gameId, name, price and discountedPrice are required",
        });
    }

    // 2. Validate game exists
    const game = await Game.findById(gameId);
    if (!game) {
        return res.status(404).json({
            success: false,
            message: "Game not found",
        });
    }

    // 3. Generate slug
    const slug = slugify(name, { lower: true, strict: true });

    // 4. Check for duplicate product inside same game
    const existingProduct = await Product.findOne({ slug, gameId });
    if (existingProduct) {
        return res.status(409).json({
            success: false,
            message: "Product already exists for this game",
        });
    }

    // 5. Validate discountedPrice
    if (discountedPrice > price) {
        return res.status(400).json({
            success: false,
            message: "discountedPrice cannot be greater than price",
        });
    }

    // 6. Image upload
    let imageUrl = null;

    if (req.file) {
        const upload = await uploadBufferToCloudinary(req.file.buffer, `products/${game.slug}`);
        imageUrl = upload.secure_url;
    }

    // 7. Create product
    const product = await Product.create({
        gameId,
        name,
        slug,
        description,
        image: imageUrl,
        price,
        discountedPrice,
        deliveryTime: deliveryTime || "Instant Delivery",
        status: status || "active",
        isPopular: isPopular || false,
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
    });

    return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
    });
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    const {
        name,
        description,
        price,
        discountedPrice,
        deliveryTime,
        status,
        isPopular,
        metaTitle,
        metaDescription,
    } = req.body;

    // 1. Validate discountedPrice
    if (discountedPrice && price && discountedPrice > price) {
        return res.status(400).json({
            success: false,
            message: "discountedPrice cannot be greater than price",
        });
    }

    // 2. Slug update
    if (name && name !== product.name) {
        const newSlug = slugify(name, { lower: true, strict: true });

        const duplicate = await Product.findOne({
            slug: newSlug,
            gameId: product.gameId,
            _id: { $ne: product._id },
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Another product with this name already exists for this game",
            });
        }

        product.slug = newSlug;
    }

    // 3. Image update
    if (req.file) {
        // upload new
        const upload = await uploadBufferToCloudinary(req.file.buffer, `products/${product.slug}`);
        const newImage = upload.secure_url;

        // delete old
        if (product.imagePublicId) {
            await deleteImageFromCloudinary(product.imagePublicId);
        }

        product.image = newImage;
        product.imagePublicId = upload.public_id;
    }

    // 4. Apply simple updates
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.discountedPrice = discountedPrice ?? product.discountedPrice;
    product.deliveryTime = deliveryTime ?? product.deliveryTime;
    product.status = status ?? product.status;
    product.isPopular = isPopular ?? product.isPopular;
    product.metaTitle = metaTitle ?? product.metaTitle;
    product.metaDescription = metaDescription ?? product.metaDescription;

    const updated = await product.save();

    return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updated,
    });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    if (product.imagePublicId) {
        await deleteImageFromCloudinary(product.imagePublicId);
    }

    await product.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});

const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Product.find()
            .populate("gameId", "name slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(),
    ]);

    return res.status(200).json({
        success: true,
        count: items.length,
        totalPages: Math.ceil(total / limit),
        page,
        data: items,
    });
});

const getSingleProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const product = await Product.findOne({ slug })

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: product,
    });
});

export {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getSingleProduct,
}