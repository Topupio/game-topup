"use client";

interface AccountPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// Windowed page list: first, last, current +/- 1, with "..." gaps.
function getPageItems(currentPage: number, totalPages: number): (number | "...")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: (number | "...")[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) items.push("...");
    for (let p = start; p <= end; p++) items.push(p);
    if (end < totalPages - 1) items.push("...");

    items.push(totalPages);
    return items;
}

export default function AccountPagination({ currentPage, totalPages, onPageChange }: AccountPaginationProps) {
    const pageItems = getPageItems(currentPage, totalPages);

    return (
        <div className="flex justify-center items-center gap-1 sm:gap-2 mt-10">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2.5 sm:px-3 py-2 rounded-lg border text-sm font-medium ${
                    currentPage === 1
                        ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                }`}
            >
                Prev
            </button>

            {pageItems.map((item, idx) =>
                item === "..." ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="w-7 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-sm text-muted-foreground select-none"
                    >
                        &hellip;
                    </span>
                ) : (
                    <button
                        key={item}
                        onClick={() => onPageChange(item)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-medium flex items-center justify-center border ${
                            currentPage === item
                                ? "bg-secondary text-white border-secondary"
                                : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                    >
                        {item}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2.5 sm:px-3 py-2 rounded-lg border text-sm font-medium ${
                    currentPage === totalPages
                        ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                }`}
            >
                Next
            </button>
        </div>
    );
}
