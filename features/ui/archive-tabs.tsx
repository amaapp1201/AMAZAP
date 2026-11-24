import Link from "next/link";
import { cn } from "@/features/helpers/utils";

// 一覧を「利用中」と「アーカイブ」で切り替えるタブ
export function ArchiveTabs({
  baseHref,
  isArchived,
}: {
  baseHref: string;
  isArchived: boolean;
}) {
  const tabs = [
    { label: "利用中", href: baseHref, isActive: !isArchived },
    { label: "アーカイブ", href: `${baseHref}?archived=1`, isActive: isArchived },
  ];

  return (
    <div className="inline-grid grid-cols-2 h-9 items-center rounded-lg bg-slate-200 p-1 text-muted-foreground w-64">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          aria-current={tab.isActive ? "page" : undefined}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
            tab.isActive && "bg-background text-foreground shadow"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
