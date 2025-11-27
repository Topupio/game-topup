"use client";

import { useRef } from "react";

interface Props {
    imageUrl: string | null;
    onChange: (file: File | null, preview: string | null) => void;
}

export default function ImageUploader({ imageUrl, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        onChange(file, preview);
    };

    return (
        <div>
            <label className="block font-medium mb-1">Game Image</label>

            <div
                className="w-32 h-32 border rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center"
                onClick={() => inputRef.current?.click()}
            >
                {imageUrl ? (
                    // next/image is recommended, but blob/object URLs from local previews aren't always supported by it.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Game image" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm text-gray-500">Upload</span>
                )}
            </div>

            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                className="hidden"
                onChange={handleUpload}
            />
        </div>
    );
}