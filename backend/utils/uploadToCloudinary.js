import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (fileBuffer, folderName = "general") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folderName, // dynamic!
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};