"use client";

import { AnimatedCheckIcon } from "./check-mark";
import { cn } from "@/features/helpers/utils";

export function Action({
  action,
  isCheckVisible = false,
  canActive = false,
  onClick,
}: {
  action: {
    id: number;
    name: string;
    point: number;
  };
  canActive?: boolean;
  isCheckVisible?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "flex items-start space-x-1 border w-full",
        canActive ? "cursor-pointer hover:bg-slate-100" : "cursor-default"
      )}
      onClick={onClick}
      disabled={!canActive}
    >
      <span className="pl-0.5 pr-2 italic flex items-baseline clip-diagonal bg-slate-200">
        <span className="font-bold text-lg">{action.point}</span>
        <span className="font-bold">pt</span>
      </span>
      <span className="min-h-[28px]">{action.name}</span>
      <AnimatedCheckIcon isVisible={isCheckVisible}></AnimatedCheckIcon>
    </button>
  );
}
