import { DailyRecordHeader } from "@/features/daily-record-page/daily-record-header";
import { DailyRecordHome } from "@/features/daily-record-page/daily-record-home";
import { EventSwitcher } from "@/features/daily-record-page/event-switcher";
import { getCurrentEvents } from "@/features/event-page/event-service";
import { getMyEventPeriod } from "@/features/event-page/event-period-service";
import {
  getTodayRecord,
  updateDailyRecord,
} from "@/features/daily-record-page/daily-record-service";
import { auth } from "@/features/helpers/auth";
import { getTeam } from "@/features/team-page/team-service";
import { isWihtinEventRange } from "@/features/daily-record-page/get-recordable-range";

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

  // このユーザーだけの入力期間が設定されていれば、イベントの開催期間の代わりにそれを使う。
  // 開始日・終了日とも入力できる日なので、開始日の 0 時から終了日の終わりまで（日本時間）とし、
  // イベントの開催期間からはみ出す分は切り捨てる
  const myPeriod = currentEvent
    ? await getMyEventPeriod(currentEvent.id, session.user.id)
    : null;
  const later = (a: string | null, b: string) =>
    a && new Date(a) > new Date(b) ? a : b;
  const earlier = (a: string | null, b: string) =>
    a && new Date(a) < new Date(b) ? a : b;
  const recordableRange =
    currentEvent && myPeriod
      ? {
          startAt: later(
            currentEvent.startAt,
            new Date(`${myPeriod.startDate}T00:00:00+09:00`).toISOString()
          ),
          endAt: earlier(
            currentEvent.endAt,
            new Date(`${myPeriod.endDate}T23:59:59+09:00`).toISOString()
          ),
        }
      : {
          startAt: currentEvent?.startAt ?? null,
          endAt: currentEvent?.endAt ?? null,
        };

  const header = (
    <DailyRecordHeader
      team={team}
      userProfile={session.user}
      event={currentEvent ? { ...currentEvent, ...recordableRange } : null}
      isPersonalPeriod={!!myPeriod}
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
    // 本人の入力期間の外の日は、表示するだけで空の記録を作らない
    allowCreate:
      !myPeriod ||
      isWihtinEventRange(recordableRange, isoCurrentDate, "Asia/Tokyo"),
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
          startAt: recordableRange.startAt,
          endAt: recordableRange.endAt,
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
