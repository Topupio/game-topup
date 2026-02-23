"use client";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    limit = 12,
    onPageChange,
    onLimitChange,
}: PaginationProps) => {
    const limits = [12, 24, 50, 100];

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 md:px-4 py-3 bg-card border-t border-border gap-3 md:gap-4">
            {/* Items Range Info */}
            <div className="text-xs md:text-sm text-foreground">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                {/* Limit Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-foreground">Rows per page:</span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="text-xs md:text-sm border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all capitalize"
                    >
                        {limits.map((l) => (
                            <option key={l} value={l}>
                                {l}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <FaChevronLeft size={14} />
                    </button>

                    <div className="text-xs md:text-sm font-medium text-foreground">
                        Page {currentPage} of {totalPages}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <FaChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
