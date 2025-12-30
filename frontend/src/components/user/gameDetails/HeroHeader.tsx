"use client";

interface HeroHeaderProps {
    imageUrl: string;
    title: string;
    subtitle?: string;
}

export default function HeroHeader({ imageUrl, title, subtitle }: HeroHeaderProps) {
    return (
        <div className="relative h-64 sm:h-80 w-full rounded-b-3xl overflow-hidden">
            <img
                src="https://cdn2.unrealengine.com/genshin-natlan-2560x1440-7c1488a69af0.jpg"
                className="w-full h-full object-cover opacity-80 rounded-b-3xl"
            />

            <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-black/40" />

            <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <img
                    src={imageUrl}
                    className="w-20 h-20 object-cover rounded-xl shadow-xl border border-white/20"
                />

                <div>
                    <h1 className="text-3xl font-bold tracking-wide">{title}</h1>
                    <p className="text-gray-300 text-sm">{subtitle || "Top-up Game Utilities"}</p>
                </div>
            </div>
        </div>
    );
}
