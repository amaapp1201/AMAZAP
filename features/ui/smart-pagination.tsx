"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/features/ui/pagination";
import { useMemo } from "react";

export function SmartPagination({
  currentPage,
  totalPages,
  baseHref,
  delta = 2,
}: {
  currentPage: number;
  totalPages: number;
  baseHref?: string;
  delta?: number; // 前後に表示するページ数
}) {
  const pageNumbers = useMemo(() => {
    const box = [];
    // ページの範囲を計算して表示
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      box.push(i);
    }

    return box;
  }, []);

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous  */}
        <PaginationItem>
          <PaginationPrevious
            href={`${baseHref}?${
              currentPage > 1 ? `?page=${currentPage - 1}` : "#"
            }`}
          />
        </PaginationItem>

        {/* 1... */}
        {currentPage > delta + 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={`${baseHref}?page=1`}>1</PaginationLink>
            </PaginationItem>
            {currentPage > delta + 2 && <PaginationEllipsis />}
          </>
        )}

        {/* 1 [2] 3 */}
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={`${baseHref}?page=${page}`}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* ...10 */}
        {currentPage < totalPages - delta && (
          <>
            {currentPage < totalPages - delta - 1 && <PaginationEllipsis />}
            <PaginationItem>
              <PaginationLink href={`${baseHref}?page=${totalPages}`}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            href={
              currentPage < totalPages
                ? `${baseHref}?page=${currentPage + 1}`
                : "#"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
