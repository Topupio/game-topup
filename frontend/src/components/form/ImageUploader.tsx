"use client";

import { useRef, useState } from "react";
import { FaCloudUploadAlt, FaEdit, FaTrash } from "react-icons/fa";
import ImageCropper from "./ImageCropper";

interface Props {
    imageUrl: string | null;
    onChange: (file: File | null, preview: string | null) => void;
    error?: string;
    aspectRatio?: number;
}

export default function ImageUploader({ imageUrl, onChange, error, aspectRatio = 16 / 9 }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create a URL for the selected file to pass to the cropper
        const src = URL.createObjectURL(file);
        setOriginalFile(file);
        setSelectedImageSrc(src);
        setShowCropper(true);

        // Reset input value so same file can be selected again if needed
        e.target.value = "";
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        if (!originalFile) return;

        // Create a new File from the Blob
        const croppedFile = new File([croppedBlob], originalFile.name, {
            type: originalFile.type,
            lastModified: Date.now(),
        });

        // Create preview URL
        const preview = URL.createObjectURL(croppedBlob);

        onChange(croppedFile, preview);
        setShowCropper(false);
        setSelectedImageSrc(null);
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setSelectedImageSrc(null);
        setOriginalFile(null);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null, null);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
            </label>

            <div
                className={`relative w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden group
                    ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}
                `}
                onClick={() => inputRef.current?.click()}
            >
                {imageUrl ? (
                    <>
                        <img
                            src={imageUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <span className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                                <FaEdit size={20} />
                            </span>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition"
                            >
                                <FaTrash size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6 text-gray-500">
                        <FaCloudUploadAlt className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-medium text-gray-700">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                )}
            </div>

            {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                className="hidden"
                onChange={handleUpload}
            />

            {showCropper && selectedImageSrc && (
                <ImageCropper
                    imageSrc={selectedImageSrc}
                    onCancel={handleCancelCrop}
                    onCropComplete={handleCropComplete}
                    aspectRatio={aspectRatio}
                />
            )}
        </div>
    );
}