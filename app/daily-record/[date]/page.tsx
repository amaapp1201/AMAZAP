import { DailyRecordHome } from "@/features/daily-record-page/daily-record-home";
import { getCurrentEvent } from "@/features/event-page/event-service";
import {
  getTodayRecord,
  updateDailyRecord,
} from "@/features/daily-record-page/daily-record-service";
import { auth } from "@/features/helpers/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const session = await auth();

  if (!session) {
    throw new Error("session is null");
  }

  // 現在のイベント取得(アクション含む)
  const currentEvent = await getCurrentEvent();

  if (!currentEvent) {
    return <div>現在開催中のイベントはありません。</div>;
  }

  if (!session.user.teamId) {
    return <div>チームに所属していません。チーム登録をしてください。</div>;
  }

  if (
    currentEvent.event_teams.findIndex(
      (team) => team.team_id === session.user.teamId
    ) === -1
  ) {
    return <div>参加チームがイベントに参加していません。</div>;
  }

  const isoActualCurrentDate = new Date().toISOString();
  const isoCurrentDate = new Date(decodeURIComponent(date)).toISOString();

  // デイリーレコード取得
  const todayDailyRecord = await getTodayRecord({
    userId: session.user.id,
    eventId: currentEvent.id,
    isoCurrentDate: isoCurrentDate,
    snapshot_team_id: session.user.teamId,
  });

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
          name: category.name_snapshot ?? "名称不明",
          orderId: category.order_id_snapshot ?? 0,
          isSingleSelection: category.is_single_selection_snapshot,
          actions: category.event_actions_snapshot.map((action) => ({
            id: action.action_id,
            name: action.name,
            point: action.point,
            orderId: action.order_id,
          })),
        })),
        teams: currentEvent.event_teams.map((team) => ({
          id: team.team_id,
          name: team.name_snapshot ?? "名称不明",
        })),
      }}
      todayDailyRecord={todayDailyRecord}
      isoCurrentDate={isoCurrentDate}
      isoActualCurrentDate={isoActualCurrentDate}
      updateDailyRecord={updateDailyRecord}
    ></DailyRecordHome>
  );
}

export const dynamic = "force-dynamic";
