export default function CategoryShimmer() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="h-8 w-full rounded-lg bg-muted animate-pulse"
                />
            ))}
        </div>
    );
}
