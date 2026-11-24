import { DailyRecordHome } from "@/features/daily-record-page/daily-record-home";
import { getEvent } from "@/features/event-page/event-service";
import { isYesterdayInLocal } from "@/features/helpers/utils";
import { auth } from "@/features/helpers/auth";

export default async function Page({
  params: { eventId },
}: {
  params: { eventId: number };
}) {
  const session = await auth();

  if (!session) {
    throw new Error("session is null");
  }
  // 現在のイベント取得(アクション含む)
  const currentEvent = await getEvent(eventId);

  if (!currentEvent) {
    return <div>該当するイベントが存在しませんでした</div>;
  }

  const isoActualCurrentDate = new Date().toISOString();
  const isoCurrentDate = new Date().toISOString();

  // ダミーデイリーレコード取得
  const todayDailyRecord = {
    id: 0,
    date: isoActualCurrentDate,
    today_step_summary: 3000,
    today_action_point_summary: 100,
    last_step_cumulative: 10000,
    last_action_point_cumulative: 300,
    record_actions: [],
  };

  return (
    <DailyRecordHome
      userId={session.user.id}
      currentEvent={{
        id: currentEvent.id,
        name: currentEvent.name,
        startAt: currentEvent.startAt,
        endAt: currentEvent.endAt,
        isTeamRankVisible: currentEvent.is_team_rank_visible,
        isUserRankVisible: currentEvent.is_user_rank_visible,
        categories: currentEvent.event_categories.map((category) => ({
          id: category.category_id,
          name: category.action_categories?.name ?? "名称不明",
          orderId: category.action_categories?.order_id ?? 0,
          isSingleSelection:
            category.action_categories?.is_single_selection ?? false,
          actions:
            category.action_categories?.actions.map((action) => ({
              id: action.id,
              name: action.name,
              point: action.point,
              orderId: action.order_id,
            })) ?? [],
        })),
        teams: currentEvent.event_teams.map((team) => ({
          id: team.team_id,
          name: team.teams?.name ?? "名称不明",
        })),
      }}
      todayDailyRecord={todayDailyRecord}
      isoCurrentDate={isoCurrentDate}
      isoActualCurrentDate={isoActualCurrentDate}
      preview={true}
      updateDailyRecord={updateDailyRecord}
    ></DailyRecordHome>
  );
}
async function updateDailyRecord() {
  "use server";

  return;
}

export const dynamic = "force-dynamic";
