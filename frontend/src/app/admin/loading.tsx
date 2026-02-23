export default function Loading() {
    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-6" />
            <div className="h-10 w-full bg-muted rounded-lg mb-4" />
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded-lg" />
                ))}
            </div>
        </div>
    );
}
