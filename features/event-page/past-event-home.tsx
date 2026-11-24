import { Category } from "../action-page/type";
import { Event, PublishedEvent } from "../daily-record-page/types";
import { Team } from "../user-page/type";
import { ExpandedEventCard } from "./event-card";
import { UpdateRequestEventSchemaType } from "./schema";

export function PastEventHome({
  events,
  teams,
  categories,
  updateRankVisible,
  copyEvent,
  publishEvent,
}: {
  events?: PublishedEvent[] | null;
  teams: Team[];
  categories: Category[];
  updateRankVisible?: (data: {
    eventId: number;
    isTeamRankVisible?: boolean;
    isUserRankVisible?: boolean;
  }) => Promise<any>;
  publishEvent?: (eventId: number) => Promise<any>;
  copyEvent: (eventId: number) => Promise<{ eventId: number }>;
}) {
  if (!events || events.length === 0) {
    return <div>過去に実施されたイベントはありません。</div>;
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
          isDefaultShowCategories={false}
          isDefaultShowTeams={false}
          isShowEditMenu={true}
          isShowPreviewButton={true}
          isShowEditButton={false}
          teams={teams}
          updateRankVisible={updateRankVisible}
          categories={categories}
          isPublisable={true}
          isArchivable={false}
          publishEvent={publishEvent}
          copyEvent={copyEvent}
          isArchived={true}
          isPublished={true}
        ></ExpandedEventCard>
      ))}
    </div>
  );
}
