import Link from "next/link";

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center gap-2 mt-10">

            {/* Prev */}
            <Link
                href={`?page=${currentPage - 1}`}
                className={`px-3 py-2 rounded-lg border ${
                    currentPage === 1
                        ? "opacity-40 cursor-not-allowed pointer-events-none"
                        : "hover:bg-white/10 bg-white/5 border-white/10 text-white"
                }`}
            >
                Prev
            </Link>

            {/* Page Numbers */}
            {pageNumbers.map((num) => (
                <Link
                    key={num}
                    href={`?page=${num}`}
                    className={`
                        w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center border
                        ${currentPage === num
                            ? "bg-secondary text-black border-secondary"
                            : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                        }
                    `}
                >
                    {num}
                </Link>
            ))}

            {/* Next */}
            <Link
                href={`?page=${currentPage + 1}`}
                className={`px-3 py-2 rounded-lg border ${
                    currentPage === totalPages
                        ? "opacity-40 cursor-not-allowed pointer-events-none"
                        : "hover:bg-white/10 bg-white/5 border-white/10 text-white"
                }`}
            >
                Next
            </Link>

        </div>
    );
}

export default Pagination;