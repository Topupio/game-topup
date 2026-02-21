"use client";

interface AccountPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function AccountPagination({ currentPage, totalPages, onPageChange }: AccountPaginationProps) {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center gap-2 mt-10">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    currentPage === 1
                        ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                }`}
            >
                Prev
            </button>

            {pageNumbers.map((num) => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center border ${
                        currentPage === num
                            ? "bg-secondary text-white border-secondary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                >
                    {num}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${
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
