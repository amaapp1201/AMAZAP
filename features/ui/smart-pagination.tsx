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
  // baseHref にすでに ?archived=1 などが付いていれば & でつなぐ
  const hrefPrefix = baseHref?.includes("?") ? `${baseHref}&` : `${baseHref}?`;

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
            href={`${hrefPrefix}${
              currentPage > 1 ? `?page=${currentPage - 1}` : "#"
            }`}
          />
        </PaginationItem>

        {/* 1... */}
        {currentPage > delta + 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={`${hrefPrefix}page=1`}>1</PaginationLink>
            </PaginationItem>
            {currentPage > delta + 2 && <PaginationEllipsis />}
          </>
        )}

        {/* 1 [2] 3 */}
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={`${hrefPrefix}page=${page}`}
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
              <PaginationLink href={`${hrefPrefix}page=${totalPages}`}>
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
                ? `${hrefPrefix}page=${currentPage + 1}`
                : "#"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
