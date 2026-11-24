"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

export function Collapsible({
  children,
  isDefaultShow,
  title,
}: {
  children: React.ReactNode;
  isDefaultShow: boolean;
  title: string;
}) {
  const [isVisible, setIsVisible] = useState(isDefaultShow);

  return (
    <div className="flex flex-col space-y-3 items-stretch">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible((prev) => !prev)}
        className="h-6 p-0 text-slate-600 self-start"
      >
        {isVisible ? (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            {title}
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4 mr-2" />
            {title}
          </>
        )}
      </Button>
      {isVisible && <>{children}</>}
    </div>
  );
}
