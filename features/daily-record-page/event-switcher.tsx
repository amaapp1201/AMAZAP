import Link from "next/link";
import { cn } from "@/features/helpers/utils";

// 参加している進行中のイベントが複数あるときに、記録するイベントを切り替えるタブ
export function EventSwitcher({
  events,
  selectedEventId,
  urlDate,
}: {
  events: { id: number; name: string }[];
  selectedEventId: number;
  // URL に入っている日付（yyyy-MM-dd）。切り替えても同じ日付のままにする
  urlDate: string;
}) {
  return (
    <nav aria-label="イベントの切り替え" className="px-4 pb-3">
      <div className="text-xs text-muted-foreground mb-1">
        参加中のイベント（{events.length}件）。記録はイベントごとに入力します。
      </div>
      <div className="flex flex-wrap gap-2">
        {events.map((event) => {
          const isSelected = event.id === selectedEventId;
          return (
            <Link
              key={event.id}
              href={`/daily-record/${urlDate}?event=${event.id}`}
              aria-current={isSelected ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-sm break-all",
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white font-bold"
                  : "bg-white text-slate-700"
              )}
            >
              {event.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
