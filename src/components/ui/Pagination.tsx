import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const pages = getPageNumbers();

  const startItem = totalItems !== undefined && itemsPerPage !== undefined 
    ? (currentPage - 1) * itemsPerPage + 1 
    : null;
  const endItem = totalItems !== undefined && itemsPerPage !== undefined
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6 bg-slate-50/50 border-t border-slate-100 ${className}`}>
      {/* Left text info */}
      <div className="text-xs font-semibold text-slate-500">
        {startItem !== null && endItem !== null && totalItems !== undefined ? (
          <span>
            Menampilkan <span className="text-slate-800">{startItem}-{endItem}</span> dari <span className="text-slate-800">{totalItems}</span> item
          </span>
        ) : (
          <span>Halaman {currentPage} dari {totalPages}</span>
        )}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`
            flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500
            transition-colors duration-150 hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40
          `}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150
              ${currentPage === page
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            {page}
          </button>
        ))}

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`
            flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500
            transition-colors duration-150 hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40
          `}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
export { Pagination };
