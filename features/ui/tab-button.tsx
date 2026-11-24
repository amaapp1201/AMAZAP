"use client";

import { useState } from "react";

export function TabButton({
  buttons,
}: {
  buttons: {
    label: string;
    onClick: () => void;
    defaultIsActive?: boolean;
  }[];
}) {
  const [activeIndex, setActiveIndex] = useState(
    buttons.findIndex((b) => b.defaultIsActive) ?? 0
  );

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`h-9 items-center justify-center rounded-lg bg-slate-200 p-1 text-muted-foreground grid w-full`}
      tabIndex={0}
      data-orientation="horizontal"
      style={{
        outline: "none",
        gridTemplateColumns: `repeat(${buttons.length}, minmax(0, 1fr))`,
      }}
    >
      {buttons.map((button, index) => (
        <button
          key={button.label}
          type="button"
          role="tab"
          data-state={button.defaultIsActive ? "active" : "inactive"}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
          tabIndex={index}
          onClick={() => {
            if (index === activeIndex) return;
            setActiveIndex(index);
            button.onClick();
          }}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
