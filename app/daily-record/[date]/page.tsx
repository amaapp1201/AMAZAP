import { DailyRecordHeader } from "@/features/daily-record-page/daily-record-header";
import { DailyRecordHome } from "@/features/daily-record-page/daily-record-home";
import { EventSwitcher } from "@/features/daily-record-page/event-switcher";
import { getCurrentEvents } from "@/features/event-page/event-service";
import {
  getTodayRecord,
  updateDailyRecord,
} from "@/features/daily-record-page/daily-record-service";
import { auth } from "@/features/helpers/auth";
import { getTeam } from "@/features/team-page/team-service";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{
    event?: string; // 表示するイベントの id。進行中のイベントに複数参加しているときに使う
  }>;
}) {
  const { date } = await params;
  const { event: eventParam } = await searchParams;
  const session = await auth();

  if (!session) {
    throw new Error("session is null");
  }

  const teamId = session.user.teamId;
  const team = teamId ? await getTeam({ teamId }) : null;

  // 進行中のイベントのうち、自分のチームが参加しているもの
  const currentEvents = await getCurrentEvents();
  const myEvents = teamId
    ? currentEvents.filter((event) =>
        event.event_teams.some((eventTeam) => eventTeam.team_id === teamId)
      )
    : [];

  // ?event= で指定されたものを表示する。指定がない、または参加していないイベントなら先頭のもの
  const currentEvent =
    myEvents.find((event) => event.id === Number(eventParam)) ??
    myEvents[0] ??
    null;

  const isoActualCurrentDate = new Date().toISOString();

  const header = (
    <DailyRecordHeader
      team={team}
      userProfile={session.user}
      event={currentEvent}
      isoCurrentDate={isoActualCurrentDate}
    ></DailyRecordHeader>
  );

  if (!currentEvent || !teamId) {
    return (
      <>
        {header}
        <div className="p-4">
          {!teamId
            ? "チームに所属していません。チーム登録をしてください。"
            : currentEvents.length === 0
            ? "現在開催中のイベントはありません。"
            : "所属チームが参加している開催中のイベントはありません。"}
        </div>
      </>
    );
  }

  const isoCurrentDate = new Date(decodeURIComponent(date)).toISOString();

  // デイリーレコード取得
  const todayDailyRecord = await getTodayRecord({
    userId: session.user.id,
    eventId: currentEvent.id,
    isoCurrentDate: isoCurrentDate,
    snapshot_team_id: teamId,
  });

  return (
    <>
      {header}
      {myEvents.length > 1 && (
        <div className="pt-3">
          <EventSwitcher
            events={myEvents.map((event) => ({
              id: event.id,
              name: event.name,
            }))}
            selectedEventId={currentEvent.id}
            urlDate={date}
          ></EventSwitcher>
        </div>
      )}
      <DailyRecordHome
        // イベントを切り替えたときに、入力中の状態を持ち越さない
        key={currentEvent.id}
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
    </>
  );
}

export const dynamic = "force-dynamic";
