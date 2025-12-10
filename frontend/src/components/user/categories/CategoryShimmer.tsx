export default function CategoryShimmer() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="h-8 w-full rounded-full bg-white/10 animate-pulse"
                />
            ))}
        </div>
    );
}
