import { asyncHandler } from "../middlewares/asyncHandler.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

// @desc    Upload an image (for rich text editor)
// @route   POST /api/upload/image
// @access  Admin
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image file provided",
        });
    }

    const upload = await uploadBufferToCloudinary(req.file.buffer, "description-images");

    return res.status(200).json({
        success: true,
        data: {
            url: upload.secure_url,
        },
    });
});
