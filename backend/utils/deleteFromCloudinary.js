import cloudinary from "cloudinary";

export const deleteImageFromCloudinary = async (publicId) => {
    if (!publicId) return;

    try {
        await cloudinary.v2.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
    }
};
