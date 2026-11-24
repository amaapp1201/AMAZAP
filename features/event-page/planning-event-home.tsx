import { Event } from "../daily-record-page/types";
import { ExpandedEventCard } from "./event-card";
import {
  CreateRequestEventSchemaType,
  UpdateRequestEventSchemaType,
} from "./schema";
import { NewEventSheet } from "./new-event-sheet";
import { Category } from "../action-page/type";
import { Team } from "../user-page/type";

export function PlanningEventHome({
  events,
  createEvent,
  updateEvent,
  teams,
  categories,
  publishEvent,
  updateRankVisible,
  copyEvent,
}: {
  events?: Event[] | null;
  createEvent: (event: CreateRequestEventSchemaType) => Promise<{
    eventId: number;
  }>;
  updateEvent: (
    data: UpdateRequestEventSchemaType
  ) => Promise<{ eventId: number }>;
  publishEvent: (eventId: number) => Promise<any>;
  teams: Team[];
  categories: Category[];
  updateRankVisible?: (data: {
    eventId: number;
    isTeamRankVisible?: boolean;
    isUserRankVisible?: boolean;
  }) => Promise<any>;
  copyEvent: (eventId: number) => Promise<{ eventId: number }>;
}) {
  if (!events || events.length === 0) {
    return (
      <div>
        計画中のイベントはありません。
        <NewEventSheet
          teams={teams}
          categories={categories}
          createEvent={createEvent}
        />
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
            isPublished: false,
            categories: event.event_categories.map((category) => ({
              id: category.category_id,
              name: category.action_categories?.name ?? "名称不明",
              orderId: category.action_categories?.order_id ?? 0,
              actions:
                category.action_categories?.actions.map((action) => ({
                  id: action.id,
                  name: action.name,
                  point: action.point,
                  orderId: action.order_id,
                })) ?? [],
            })),
            teams: event.event_teams.map((team) => ({
              id: team.team_id,
              name: team.teams?.name ?? "名称不明",
            })),
          }}
          isShowPreviewButton={true}
          isDefaultShowCategories={false}
          isDefaultShowTeams={false}
          isShowEditMenu={true}
          teams={teams}
          categories={categories}
          updateEvent={updateEvent}
          publishEvent={publishEvent}
          updateRankVisible={updateRankVisible}
          isArchivable={false}
          copyEvent={copyEvent}
        ></ExpandedEventCard>
      ))}
    </div>
  );
}
