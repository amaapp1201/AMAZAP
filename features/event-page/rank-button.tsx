"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Award } from "lucide-react";

export function RankButton({
  eventId,
  iconOnly = false,
}: {
  eventId: number;
  iconOnly?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-white bg-yellow-600"
      asChild
    >
      <Link href={`/reports/${eventId}`} aria-labelledby="rank-link-button">
        <span id="rank-link-button" className="hidden">
          ランキングページリンク
        </span>
        {iconOnly ? (
          <Award className="w-4 h-4"></Award>
        ) : (
          <>
            <Award className="w-4 h-4 mr-2"></Award>ランキング
          </>
        )}
      </Link>
    </Button>
  );
}
