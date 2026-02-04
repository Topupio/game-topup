import Link from "next/link";

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center gap-2 mt-10">

            {/* Prev */}
            <Link
                href={`?page=${currentPage - 1}`}
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    currentPage === 1
                        ? "opacity-40 cursor-not-allowed pointer-events-none border-border text-muted-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                }`}
            >
                Prev
            </Link>

            {/* Page Numbers */}
            {pageNumbers.map((num) => (
                <Link
                    key={num}
                    href={`?page=${num}`}
                    className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center border ${
                        currentPage === num
                            ? "bg-secondary text-white border-secondary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                >
                    {num}
                </Link>
            ))}

            {/* Next */}
            <Link
                href={`?page=${currentPage + 1}`}
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    currentPage === totalPages
                        ? "opacity-40 cursor-not-allowed pointer-events-none border-border text-muted-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                }`}
            >
                Next
            </Link>

        </div>
    );
}

export default Pagination;
