import Link from "next/link";
import { PublishedEvent } from "../daily-record-page/types";
import { ExpandedEventCard } from "./event-card";
import { Team } from "../user-page/type";
import { Category } from "../action-page/type";
import { UpdateRequestEventSchemaType } from "./schema";

export function CurrentEventHome({
  events,
  teams,
  categories,
  updateEvent,
  archiveEvent,
  updateRankVisible,
  copyEvent,
}: {
  events?: PublishedEvent[] | null;
  teams: Team[];
  categories: Category[];
  updateEvent: (
    data: UpdateRequestEventSchemaType
  ) => Promise<{ eventId: number }>;
  archiveEvent?: (eventId: number) => Promise<any>;
  updateRankVisible?: (data: {
    eventId: number;
    isTeamRankVisible?: boolean;
    isUserRankVisible?: boolean;
  }) => Promise<any>;
  copyEvent: (eventId: number) => Promise<{ eventId: number }>;
}) {
  // empty state
  if (!events || events.length === 0) {
    return (
      <div>
        <div>現在進行中のイベントはありません。</div>
        <Link href="/admin/events/plan">イベント計画ページへ</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {events.map((event) => (
        <ExpandedEventCard
          key={event.id}
          event={{
            id: event.id,
            name: event.name,
            startAt: event.startAt,
            endAt: event.endAt,
            isTeamRankVisible: event.is_team_rank_visible,
            isUserRankVisible: event.is_user_rank_visible,
            isPublished: true,
            categories: event.event_categories.map((category) => ({
              id: category.category_id,
              name: category.name_snapshot ?? "名称不明",
              orderId: category.order_id_snapshot ?? 0,
              actions: category.event_actions_snapshot.map((action) => ({
                id: action.action_id,
                name: action.name,
                point: action.point,
                orderId: action.order_id,
              })),
            })),
            teams: event.event_teams.map((team) => ({
              id: team.team_id,
              name: team.name_snapshot ?? "名称不明",
            })),
          }}
          isDefaultShowCategories={true}
          isDefaultShowTeams={true}
          isShowEditMenu={true}
          teams={teams}
          categories={categories}
          updateEvent={updateEvent}
          archiveEvent={archiveEvent}
          updateRankVisible={updateRankVisible}
          isPublisable={false}
          isPublished={true}
          copyEvent={copyEvent}
        ></ExpandedEventCard>
      ))}
    </div>
  );
}
